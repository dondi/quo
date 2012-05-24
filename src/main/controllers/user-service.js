/**
 * user-service.js
 *
 * Controller responsible for handling the user account and
 * administrative functions of Quo.
 */
module.exports = function (app, client) {

  // Imports
  var sanitize = require('validator').sanitize,

    // Helper function to sanitize pre-DB layer user input
    sanitizeAuthentication = function (userInput) {
      return (userInput !== sanitize(userInput).xss() && userInput.indexOf("'") === -1);
    };

    /*
     * POST /
     *   Handles login credentials
     */
    // TODO This is *the* user authentication service, which means it belongs
    //      here.  However, '/' is probably not the best URI for it.
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
                if (result) {
                    session.user = user;
                    session.accountId = result[0].accountId;
                }
                res.send(result);
            });
        }
    });
  
  
    /*
     * GET /users
     *   [TODO]
     *
     * Per REST, this URI should return the collection of all users in the
     * system.  TODO Decide on the credentials, if any, that are necessary
     *               for viewing this list.
     */
    app.get('/users', function (req, res) {
        res.send("This service is not yet implemented.", 500);
    });
  
  
    /*
     * GET /users/:username
     *   [TODO]
     *
     * This URI returns a JSON representation of the user with the given
     * username.
     */
    app.get('/users/:username', function (req, res) {
        res.send("This service is not yet implemented.", 500);
    });
  
}