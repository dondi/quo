/**
 * app.js
 *
 * Server configuration file that runs the web app
 */

var express = require('express'),
    
    everyauth = require('everyauth'),
    
    mysql = require('mysql'),
    
    client = mysql.createClient({
      ACCOUNTS_TABLE : "quo_accounts",
      TWIT_TABLE : "quo_twit",
      host : "mysql.cs.lmu.edu",
      database : "quo"
    }),
    
    errors = "";
    
/*
 *
 *  **** CONFIGURATION ****
 *
 */

// Check that the proper credentials have been set, otherwise, do not mess with database stuff
if (process.env.QUO_DB_USER && process.env.QUO_DB_PASS) {
  client.user = process.env.QUO_DB_USER;
  client.password = process.env.QUO_DB_PASS;
  require('./conf/db-config.js')(client);
} else {
  errors += "\n[X] Database user and/or password not found in environment.\n" +
            "[X] No database will be available to this process.";
}


// Test; creates quodev account, then tests its Id fetch and a media table creation
client.createAccount("quodev", "quodev", "quodev@gmail.com", function (result) {console.log(result)});
client.getAccountId("quodev", function (result) {
  client.updateMediaProfile(result, JSON.stringify({"test": "stuff"}), client.TWIT_TABLE, function (result) {
    console.log("[i] Twitter update for quodev successful");
  });
});


// Everyauth configs
if (process.env.QUO_TWIT_KEY && process.env.QUO_TWIT_SECRET) {
  everyauth
    .twitter
      .consumerKey(process.env.QUO_TWIT_KEY)
      .consumerSecret(process.env.QUO_TWIT_SECRET)
      .findOrCreateUser(function (sess, accessToken, accessSecret, twitUser) {
        // TODO: Search the database and return user if found; otherwise create it
        // twitUser needs to be made available to account-controller.js
        // This is a temporary fix until the database is up and available
        everyauth.user = twitUser;
        everyauth.user.accessToken = accessToken;
        everyauth.user.accessSecret = accessSecret;
        return twitUser;
      })
      .redirectPath('/main');
} else {
  errors += "\n[X] Twitter consumer credentials not found in environment.\n" +
            "[X] There will be no Twitter connectivity in the process."
}
    
// Report any configuration errors
console.error(errors || "\n[!] Configuration successful.");

var app = module.exports = express.createServer(
      express.bodyParser(),
      express.static(__dirname + '/public'),
      express.cookieParser(),
      express.methodOverride(),
      express.session({
        secret: 'badonka donk'
      }),
      everyauth.middleware()
    );


/*
 *
 *  **** APPLICATION DEFINITION ****
 *
 */

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set("view options", {
    layout: false
  });
  app.register('.html', {
    compile: function (str, options) {
      return function (locals) {
        return str;
      };
    }
  });
});

app.configure('development', function () {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});


/*
 *
 *  **** CONTROLLERS ****
 *
 */

require('./controllers/account-controller.js')(app, client, everyauth);
require('./controllers/pipeline-controller.js')(app, everyauth);

/*
 *
 *  **** SERVER START ****
 *
 */

app.listen(4000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
