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

    // To be initialized upon destination configuration.
    destinations,

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
configurationResult = require("./conf/destination-config.js")(everyauth);
destinations = configurationResult.destinations;
errors += (configurationResult.errors || "");

// Report any configuration errors.
console.error(errors || "\n[!] Configuration successful.");

// Initialize the app.
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

app.DESTINATIONS = destinations;

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
require("./controllers/destination-service.js")(app, database);
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
