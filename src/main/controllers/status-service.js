/**
 * status-service.js
 *
 * Controller responsible for handling the processing of status
 * updates in Quo.
 */
module.exports = function (app, client) {
    var https = require("https"),
        sechash = require("sechash"),
        crypto = require("crypto"),

        // Runs through the filter list with the given message
        filterExec = function (message, filters) {
            var f, currentFilter;

            filters = filters.split(",");
            for (f in filters) {
                currentFilter = app.BUILT_IN_FILTERS[filters[f]];
                if (currentFilter) {
                    message = currentFilter(message);
                }
            }
            return message;
        };

    /*
     * POST /status
     */
    app.post("/status", function (req, res) {
        var accountId = req.session.accountId;

        // Get the DB info for the user's access token and secret.
        client.getMediaProfile(accountId, client.TWIT_TABLE, function (profile) {
            profile = JSON.parse(profile);

            // Generate a time stamp based on GMT (Universal Time).
            var timestamp = JSON.stringify(Math.floor(((new Date().getTime()) + (8 * 60 * 60)) / 1000)),

                // The nonce is used by Twitter to prevent duplicate requests.
                nonce = sechash.basicHash('md5', timestamp),

                // Get the DB query results.
                accessSecret = profile["accountSecret"],
                accessToken = profile["accountToken"],

                // The data object.
                data = req.body,

                // Fetch the user's Tweet.
                encodedPost = data["message"],
                filters = data["filters"],

                // The signature ensures the HTTPS request has not been altered in transit.
                signature = (function () {
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

                        // The base string of the hash that is the signature.
                        signatureBaseString = "",

                        // The salt that will be used to hash the signatureBaseString.
                        signingKey = "",

                        // Loop variables.
                        i,
                        max;

                    encodedKeys.sort();

                    // Generate the parameter string.
                    for (i = 0, max = encodedKeys.length - 1; i < max; i += 1) {
                        parameterString = parameterString.concat(encodedKeys[i] +
                                "=" + keyValuePairs[encodedKeys[i]] + "&");
                    }
                    parameterString = parameterString.concat(encodedKeys[i] +
                            "=" + keyValuePairs[encodedKeys[i]]);

                    // Create the Signature Base String.
                    signatureBaseString = "POST&" +
                            encodeURIComponent("https://api.twitter.com/1/statuses/update.json") + 
                            "&" + encodeURIComponent(parameterString);

                    // Create the Signing Key.
                    signingKey = encodeURIComponent(process.env.QUO_TWIT_SECRET) + "&" +
                            encodeURIComponent(accessSecret);

                    // Return the signature.
                    return crypto
                            .createHmac("sha1", signingKey)
                            .update(signatureBaseString)
                            .digest("base64");
                })(),

                // Authorized header for the specialized POST to Twitter.
                authInfo = "OAuth oauth_consumer_key=\"" + process.env.QUO_TWIT_KEY + "\", " + 
                        "oauth_nonce=\"" + nonce + "\", " +
                        "oauth_signature=\"" + encodeURIComponent(signature) + "\", " +
                        "oauth_signature_method=\"HMAC-SHA1\", " + 
                        "oauth_timestamp=\"" + timestamp + "\", " +
                        "oauth_token=\"" + accessToken + "\", " + 
                        "oauth_version=\"1.0\"",
        
                // Authorized request to Twitter to post status update.
                post_req = https.request(
                    {
                        host: "api.twitter.com",
                        port: "443",
                        path: "/1/statuses/update.json",
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Connection": "close",
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Content-Length": "status=".length + encodedPost.length,
                            "Authorization": authInfo
                        }
                    },

                    function (twitterResponse) {
                        twitterResponse.setEncoding("utf8");
                        twitterResponse.on("data", function (chunk) {
                            res.send(chunk);
                        });
                    }
                );

            // Send the request.
            post_req.write("status=" + encodedPost);
            post_req.end();
        });
    });
  
}
