/**
 * pipeline-controller.js
 *
 * Controller responsible for handling the 
 * pipeline functionality of Quo.
 */

module.exports = function (app, client, everyauth) {
  var https = require('https'),
      sechash = require('sechash'),
      crypto = require('crypto'),
      
      // Message filter to remove hash tags
      filterNoHash = function (message) {
        var rawMessage = message.split(" "),
            result = [];
        for (var i = 0; i < rawMessage.length; i++) {
          if (rawMessage[i].charAt(0) !== "#") {
            result.push(rawMessage[i]);     
          }
        }
        return result.join(" ");
      },
      
      // Message filter to turn it all uppercase
      filterYell = function (message) {
        return message.toUpperCase();
      },
      
      // Message filter to truncate for Twitter
      filterTruncate = function (message) {
        return message.substring(0, 137) + ((message.length > 140) ? "..." : "");
      },
      
      // Contains the list of filters to be used
      filterHash = {
        "filterNoHash": filterNoHash,
        "filterYell": filterYell,
        "filterTruncate": filterTruncate
      },
      
      // Runs through the filter list with the given message
      filterExec = function (message, filters) {
        filters = filters.split(",");
        for (var f in filters) {
          var currentFilter = filterHash[filters[f]];
          if (currentFilter) {
            message = currentFilter(message);
          }
        }
        return message;
      };
  
  /*
   * GET /pipelines
   *   [TODO]
   */
  app.get('/pipelines', function (req, res) {
    // Check if a query was made on the get
    if (!req.query.username) {
      res.render('index', {
        layout: true
      });
    
    /*
     * GET /pipelines?user={username}
     *   [TODO]
     */
    } else {
      
    }
  });
  
  
  /*
   * GET /pipelines/:id
   *   [TODO]
   */
  app.get('/pipelines/:id', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  
  /*
   * GET /functions
   *   [TODO]
   */
  app.get('/functions', function (req, res) {
    // Check if a query was made on the get
    if (!req.query.q) {
      res.render('index', {
        layout: true
      });
    
    /*
     * GET /pipelines?q={search term}
     *   [TODO]
     */
    } else {
      
    }
  });
  
  
  /*
   * GET /functions/:id
   *   [TODO]
   */
  app.get('/functions/:id', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  
  /*
   * GET /fbpost/:message
   */
  app.get('/fbpost/:message', function (req, res) {
    
  });
  
  
  /*
   * POST /tweet
   *   [TODO]
   */
  app.post('/tweet', function (req, res) {
    var accountId = req.session.accountId;
    
    // Get the DB info for the user's access token and secret
    client.getMediaProfile(accountId, client.TWIT_TABLE, function(profile) {
      profile = JSON.parse(profile);
      // Generate a time stamp based on GMT (Universal Time)
      var timestamp = JSON.stringify(Math.floor(((new Date().getTime()) + (8*60*60))/1000)),
      
        // The nonce is used by Twitter to prevent duplicate requests
        nonce = sechash.basicHash('md5', timestamp),
        
        // Get the DB query results
        accessSecret = profile["accountSecret"],
        accessToken = profile["accountToken"],
        
        // The data object:
        data = req.body,
        
        // Fetch the user's Tweet
        encodedPost = data["message"],
        filters = data["filters"],
        
        // The signature ensures the HTTPS request has not been altered in transit
        signature = function () {
          // Implement the filters given by the post
          encodedPost = filterExec(encodedPost, filters);
          
          // The parameter string contains all info required by OAuth including the status
          var parameterString = "",
            
            /*
             * encodedKeys and keyValuePairs go hand-in-hand. encodedKeys is to be 
             * lexicographically sorted such that the corresponding values can be 
             * retrieved from keyValuePairs and added to the parameter string in order.
             * OAuth requires that the keys and values are added to the parameter string 
             * based on the alphabetical ordering of the encoded keys.
             */
            encodedKeys = [
              encodeURIComponent("status"),
              //encodeURIComponent("include_entities"),
              encodeURIComponent("oauth_consumer_key"),
              encodeURIComponent("oauth_nonce"),
              encodeURIComponent("oauth_signature_method"),
              encodeURIComponent("oauth_timestamp"),
              encodeURIComponent("oauth_token"),
              encodeURIComponent("oauth_version")
            ],
            keyValuePairs = {
              "status": encodeURIComponent(encodedPost),
              //"include_entities": encodeURIComponent("true"),
              "oauth_consumer_key": encodeURIComponent(process.env.QUO_TWIT_KEY),
              "oauth_nonce": encodeURIComponent(nonce),
              "oauth_signature_method": encodeURIComponent("HMAC-SHA1"),
              "oauth_timestamp": encodeURIComponent(timestamp),
              "oauth_token": encodeURIComponent(accessToken),
              "oauth_version": encodeURIComponent("1.0")
            },
            
            // The base string of the hash that is the signature
            signatureBaseString = "",
            
            // The salt that will be used to hash the signatureBaseString
            signingKey = "",
            
            // This is simply a counter variable
            i;
            
          encodedKeys.sort();
          
          // Generate the parameter string
          for (i = 0; i < encodedKeys.length - 1; i++){
            parameterString =
              parameterString.concat(encodedKeys[i] + "=" + keyValuePairs[encodedKeys[i]] + "&");
          }
          parameterString =
            parameterString.concat(encodedKeys[i] + "=" + keyValuePairs[encodedKeys[i]]);
            
          // Create the Signature Base String
          signatureBaseString = "POST&" +
            encodeURIComponent("https://api.twitter.com/1/statuses/update.json") + 
            "&" + encodeURIComponent(parameterString);
          
          
          // Create the Signing Key
          signingKey = encodeURIComponent(process.env.QUO_TWIT_SECRET) + "&" +
            encodeURIComponent(accessSecret);
          
          // Return the signature
          return crypto
            .createHmac("sha1", signingKey)
            .update(signatureBaseString)
            .digest("base64");
        }(),
      
        // Authorized header for the specialized POST to Twitter
        authInfo = "OAuth oauth_consumer_key=\"" + process.env.QUO_TWIT_KEY + "\", " + 
          "oauth_nonce=\"" + nonce + "\", " +
          "oauth_signature=\"" + encodeURIComponent(signature) + "\", " +
          "oauth_signature_method=\"HMAC-SHA1\", " + 
          "oauth_timestamp=\"" + timestamp + "\", " +
          "oauth_token=\"" + accessToken + "\", " + 
          "oauth_version=\"1.0\"",
        
        // Authorized request to Twitter to post status update
        post_req = https.request({
            host: 'api.twitter.com',
            port: '443',
            path: '/1/statuses/update.json',
            method: 'POST',
            headers: {
              "Accept" : '*/*',
              "Connection" : 'close',
              "Content-Type": 'application/x-www-form-urlencoded',
              "Content-Length": "status=".length + encodedPost.length,
              "Authorization": authInfo
            }
          },
          function (twitterResponse) {
            twitterResponse.setEncoding('utf8');
            twitterResponse.on('data', function (chunk) {
              res.send(chunk);
            });
          });
  
      // Send request
      post_req.write("status=" + encodedPost);
      post_req.end();
    })
  });
  
}