/**
 * app.js
 *
 * Server configuration file that runs the web app
 */

var express = require('express'),
    
    everyauth = require('everyauth'),
    
    mysql = require('mysql');

// Everyauth configs
everyauth
  .twitter
    .consumerKey(process.env.QUO_TWIT_KEY)
    .consumerSecret(process.env.QUO_TWIT_SECRET)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || 
        (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/');

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

    client = mysql.createClient({
      ACCOUNTS_TABLE : "quo_accounts",
      host : "mysql.cs.lmu.edu",
      database : "quo"
    });

/*
 *
 *  **** APPLICATION CONFIGURATION ****
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
 *  **** DATABASE CONFIGURATION ****
 *
 */

// Check that the proper credentials have been set, otherwise, do not mess with database stuff
if (process.env.QUO_DB_USER && process.env.QUO_DB_PASS) {
  client.user = process.env.QUO_DB_USER;
  client.password = process.env.QUO_DB_PASS;
  require('./public/js/modules/db-config.js')(client);
} else {
  console.error("Database user and/or password not found in environment.");
  console.error("No database will be available to this process.");
}

/*
 *
 *  **** CONTROLLERS ****
 *
 */

require('./controllers/account-controller.js')(app, client);
require('./controllers/pipeline-controller.js')(app);

/*
 *
 *  **** START THE SERVER ****
 *
 */

app.listen(4000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
