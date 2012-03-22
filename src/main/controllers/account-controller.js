/**
 * account-controller.js
 *
 * Controller responsible for handling the account and
 * administrative functions of Quo.
 */

module.exports = function (app, client, everyauth) {

  // Imports
  var check = require('validator').check,
      sanitize = require('validator').sanitize,
      sechash = require('sechash'),

    // Helper function to sanitize pre-DB layer user input
    sanitizeAuthentication = function (userInput) {
      return (userInput !== sanitize(userInput).xss() && userInput.indexOf("'") === -1);
    };

  /*
   * GET /
   *   Renders the login index
   */
  app.get('/', function (req, res) {
    res.render('index', {
      layout: true
    });
  });

  
  /*
   * POST /
   *   Handles login credentials
   */
  app.post('/', function (req, res) {
    var inputs = req.body,
        user = inputs["user"],
        pass = inputs["pass"], // TODO: Should be hashed; can tackle later
        session = req.session;
    
    // Sanitize the user input before running through DB
    if (sanitizeAuthentication(user) || sanitizeAuthentication(pass)) {
      res.send(false);
    } else {
      // Perform database check for authentication
      client.authenticateCredentials(user, pass, function (result) {
        res.send(result);
      });          
    }
  });
  
  
  /*
   * GET /main
   *   Renders the main screen
   */
  app.get('/main', function (req, res) {
    res.render('main', {
      layout: true
    });
  });
  
  
  /*
   * GET /users
   *   [TODO]
   */
  app.get('/users', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  
  /*
   * GET /users/:username
   *   [TODO]
   */
  app.get('/users/:username', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  /*
   *  GET /profile
   *  renders the profile screen
   */
  app.get('/profile', function (req, res) {
	    res.render('profile', {
	      layout: true
	    });
	  });
  
}