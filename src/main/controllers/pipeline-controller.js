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
   * POST /tweet/:message
   *   [TODO]
   */
  app.get('/tweet/:message', function (req, res) {
    /*console.log(req);
    return;*/
    
    /*
     * https://dev.twitter.com/docs/api
     * https://dev.twitter.com/docs/api/1/post/statuses/update
     * https://dev.twitter.com/docs/auth/authorizing-request
     * https://dev.twitter.com/docs/auth/creating-signature
     * 
     * Example OAuth request can be generated on dev.twitter.com
     */
    
    //res.send('You said: ' + req.params.message);
    
    var timestamp = JSON.stringify(Math.floor(((new Date().getTime()) + (8*60*60))/1000)),
      nonce = sechash.basicHash('md5', timestamp),
      accessToken = everyauth.user.accessToken,
      encodedPost = encodeURIComponent(req.params.message),
      signature = function () {
        /*
         * Creating the Parameter String:
         * 1) Percent encode every key and value that will be signed
         * 2) Sort the list of parameters alphabetically by encoded key
         * 3) For each key/value pair:
         *     a) Append the encoded key to the output string
         *     b) Append the '=' character to the output string
         *     c) Append the encoded value to the output string
         *     d) If there are more key/value pairs remaining, append a '&' character to the output string
         * 
         * Creating the Signature Base String:
         * 1) Convert the HTTP method (POST) to uppercase and set the output string equal to this value
         * 2) Append the '&' character to the output string
         * 3) Percent encode the URL and append it to the output string
         * 4) Append the '&' character to the output string
         * 5) Percent encode the parameter string and append it to the output string
         * 
         * Creating the Signing Key
         * 1) Percent encode the consumer secret
         * 2) Append a '&' character
         * 3) Append the percent encoded token secret
         * 
         * Calculating the Signature
         * 1) Pass the signature base string and signing key to the HMAC-SHA1 hashing algorithm
         * 2) base64 encode the output of the HMAC signing function
         */
        
        // Creating the Parameter String
        var parameterString = "",
          encodedKeys = [
            encodeURIComponent("status"),
            encodeURIComponent("include_entities"),
            encodeURIComponent("oauth_consumer_key"),
            encodeURIComponent("oauth_nonce"),
            encodeURIComponent("oauth_signature_method"),
            encodeURIComponent("oauth_timestamp"),
            encodeURIComponent("oauth_token"),
            encodeURIComponent("oauth_version")
          ],
          keyValuePairs = {
            "status": encodedPost,
            "include_entities": encodeURIComponent("true"),
            "oauth_consumer_key": encodeURIComponent(process.env.QUO_TWIT_KEY),
            "oauth_nonce": encodeURIComponent(nonce),
            "oauth_signature_method": encodeURIComponent("HMAC-SHA1"),
            "oauth_timestamp": encodeURIComponent(timestamp),
            "oauth_token": encodeURIComponent(everyauth.user.accessToken),
            "oauth_version": encodeURIComponent("1.0")
          },
          i = 0;
          
          encodedKeys.sort();
          
          for (i = 0; i < encodedKeys.length - 1; i++){
            parameterString =
              parameterString.concat(encodedKeys[i] + "=" + keyValuePairs[encodedKeys[i]] + "&");
          }
          parameterString =
            parameterString.concat(encodedKeys[i] + "=" + keyValuePairs[encodedKeys[i]]);
            
          // Creating the Signature Base String
          var signatureBaseString = "POST&" + encodeURIComponent("https://api.twitter.com/1/statuses/update.json") + 
            "&" + encodeURIComponent(parameterString);
          console.log(signatureBaseString);
          
          // Creating the Signing Key
          var signingKey = encodeURIComponent(process.env.QUO_TWIT_SECRET) + "&" +
            encodeURIComponent(everyauth.user.accessSecret);
          
          // Calculate the signature
          var hmac = crypto.createHmac("sha1", signingKey),
            hash = hmac.update(signatureBaseString),
            digest = hmac.digest("base64");
          
          return digest;
      }(),
    
      // Authorization header for the specialized POST to Twitter
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
            'Accept' : '*/*',
            'Connection' : 'close',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': encodedPost.length,
            'Authorization': authInfo
          }
        },
        function (res) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
          });
        });
    // Send request
    post_req.write("status=" + encodedPost);
    post_req.end();
  });
  
}