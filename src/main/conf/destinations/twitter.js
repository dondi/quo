/**
 * twitter.js
 *
 * Configures the Twitter destination implementation.
 */
module.exports = function (everyauth, configurationResult) {
    var https = require("https"),
        sechash = require("sechash"),
        crypto = require("crypto"),

        DESTINATION = "twitter";

    // Some modules needed for Twitter posting.
    if (process.env.QUO_TWIT_KEY && process.env.QUO_TWIT_SECRET) {
        everyauth.twitter
            .consumerKey(process.env.QUO_TWIT_KEY)
            .consumerSecret(process.env.QUO_TWIT_SECRET)
            .findOrCreateUser(function (session, accessToken, accessSecret, twitUser) {
                // TODO: Modularize the credential fetch
                var profile = JSON.stringify({
                        accountToken: accessToken,
                        accountSecret: accessSecret
                    });

                database.getAccountId(session.user, function (userId) {
                    database.updateMediaProfile(
                        userId, DESTINATION, twitUser.id, profile, database.USER_DESTINATION_TABLE,
                        function () {
                            console.log("[i] Media profile parsed for " + session.user);
                        }
                    );
                });

                return twitUser;
            })
            .redirectPath("/main");

        // Upon success, we add twitter to the destinations collection.
        configurationResult.destinations[DESTINATION] = function (status, req, res, database) {
            var accountId = req.session.accountId;

            // Get the DB info for the user's access token and secret.
            database.getMediaProfile(accountId, DESTINATION, database.USER_DESTINATION_TABLE, function (profile) {
                profile = JSON.parse(profile);

                // Generate a time stamp based on GMT (Universal Time).
                var timestamp = JSON.stringify(Math.floor(((new Date().getTime()) + (8 * 60 * 60)) / 1000)),

                    // The nonce is used by Twitter to prevent duplicate requests.
                    nonce = sechash.basicHash('md5', timestamp),

                    // Get the DB query results.
                    accessSecret = profile["accountSecret"],
                    accessToken = profile["accountToken"],

                    // The signature ensures the HTTPS request has not been altered in transit.
                    signature = (function () {
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
                                "status": encodeURIComponent(status),
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
                                "Content-Length": "status=".length + status.length,
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
                post_req.write("status=" + status);
                post_req.end();
            });
        };
    } else {
        configurationResult.errors += "\n[X] Twitter consumer credentials not found in environment.\n" +
                "[X] There will be no Twitter connectivity in the process."
    }
};
