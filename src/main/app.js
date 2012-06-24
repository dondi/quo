/**
 * app.js
 *
 * Server configuration file that runs the web app.
 */
var express = require("express"),
    everyauth = require("everyauth"),

    // "Scratch" object for holding configuration script results.
    configurationResult,

    // To be initialized upon database configuration.
    database,

    // Cumulative holder of error messages (just a plain string).
    errors = "",

    // To be initialized after configuration finishes.
    app;

/*
 *
 *  **** CONFIGURATION ****
 *
 */
 
// Set up the database client and data access objects.
configurationResult = require("./conf/db-config.js")(require("mysql"));
database = configurationResult.database;
errors += (configurationResult.errors || "");

// Set up the available destinations.
require("./conf/destination-config.js");

// Everyauth configs.
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
  /*
  everyauth.facebook
      .appId('YOUR APP ID HERE')
      .appSecret('YOUR APP SECRET HERE')
      .handleAuthCallbackError( function (req, res) {
        // If a user denies your app, Facebook will redirect the user to
        // /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
        // This configurable route handler defines how you want to respond to
        // that.
        // If you do not configure this, everyauth renders a default fallback
        // view notifying the user that their authentication failed and why.
      })
      .findOrCreateUser( function (session, accessToken, accessTokExtra, fbUserMetadata) {
        // find or create user logic goes here
      })
      .redirectPath('/main');
  */
} else {
    errors += "\n[X] Twitter consumer credentials not found in environment.\n" +
            "[X] There will be no Twitter connectivity in the process."
}
    
// Report any configuration errors.
console.error(errors || "\n[!] Configuration successful.");

app = module.exports = express.createServer(
    express.bodyParser(),
    express.static(__dirname + "/public"),
    express.cookieParser(),
    express.methodOverride(),
    express.session({
        secret: "badonka donk"
    }),
    everyauth.middleware()
);

/*
 *
 *  **** APPLICATION DEFINITION ****
 *
 */

app.configure(function () {
    app.set("views", __dirname + "/views");
    app.set("view engine", "jade");
    app.set("view options", {
        layout: false
    });
    app.register(".html", {
        compile: function (str, options) {
            return function (locals) {
                return str;
            };
        }
    });
});

app.configure("development", function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure("production", function () {
    app.use(express.errorHandler());
});


/*
 *
 *  **** CONTROLLERS ****
 *
 */

require("./controllers/user-service.js")(app, database);
require("./controllers/pipeline-service.js")(app, database);
require("./controllers/function-service.js")(app, database);

// status-service.js has to strictly appear after function-service.js because
// it relies on objects that function-service.js defines.
require("./controllers/status-service.js")(app, database);
require("./controllers/webapp.js")(app, database);

/*
 *
 *  **** SERVER START ****
 *
 */

app.listen(4000);
console.log(
    "Express server listening on port %d in %s mode",
    app.address().port,
    app.settings.env
);
