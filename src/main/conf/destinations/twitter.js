/**
 * twitter.js
 *
 * Configures the Twitter destination implementation.
 */
module.exports = function (everyauth, configurationResult) {
    if (process.env.QUO_TWIT_KEY && process.env.QUO_TWIT_SECRET) {
        everyauth.twitter
            .consumerKey(process.env.QUO_TWIT_KEY)
            .consumerSecret(process.env.QUO_TWIT_SECRET)
            .findOrCreateUser(function (sess, accessToken, accessSecret, twitUser) {
                // TODO: Modularize the credential fetch
                var profile = JSON.stringify({
                        accountToken: accessToken,
                        accountSecret: accessSecret
                    });

                database.getAccountId(sess.user, function (id) {
                    database.updateMediaProfile(id, profile, database.TWIT_TABLE, function () {
                        console.log("[i] Media profile parsed for " + sess.user);
                    });
                });

                return twitUser;
            })
            .redirectPath("/main");

        // Upon success, we add twitter to the destinations array.
        configurationResult.destinations.push("twitter");
    } else {
        configurationResult.errors += "\n[X] Twitter consumer credentials not found in environment.\n" +
                "[X] There will be no Twitter connectivity in the process."
    }
};
