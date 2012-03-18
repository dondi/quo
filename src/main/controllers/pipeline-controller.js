/**
 * pipeline-controller.js
 *
 * Controller responsible for handling the 
 * pipeline functionality of Quo.
 */

module.exports = function (app, everyauth) {
  var https = require('https'),
    sechash = require('sechash'),
    crypto = require('crypto');
  
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
   * POST /tweet/:message
   *   [TODO]
   */
  app.get('/tweet/:message', function (req, res) {
    // Generate a time stamp based on GMT (Universal Time)
    var timestamp = JSON.stringify(Math.floor(((new Date().getTime()) + (8*60*60))/1000)),
    
      // The nonce is used by Twitter to prevent duplicate requests
      nonce = sechash.basicHash('md5', timestamp),
      
      // The access token gives Quo permission to alter the user's account
      accessToken = everyauth.user.accessToken,
      
      // Fetch the user's Tweet
      encodedPost = req.params.message,
      
      // The signature ensures the HTTPS request has not been altered in transit
      signature = function () {
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
            "oauth_token": encodeURIComponent(everyauth.user.accessToken),
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
          encodeURIComponent(everyauth.user.accessSecret);
        
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

  });
  
}