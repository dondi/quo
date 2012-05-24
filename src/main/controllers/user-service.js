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

        // Sanitize the user input before running through DB.
        if (sanitizeAuthentication(user) || sanitizeAuthentication(pass)) {
            res.send(false);
        } else {
            // Perform database check for authentication.
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
        client.query(
            'SELECT accountName FROM ' + client.ACCOUNTS_TABLE,
            function (err, results) {
                // For every result, extract just the accountName into
                // an array and return that array.
                var accountNameArray = [],
                    i,
                    max = results.length;

                for (i = 0; i < max; i += 1) {
                    accountNameArray.push(results[i].accountName);
                }

                res.send(accountNameArray);
            }
        );
    });
  
  
    /*
     * GET /users/:username
     *   [TODO]
     *
     * This URI returns a JSON representation of the user with the given
     * username.
     */
    app.get('/users/:username', function (req, res) {
        client.query(
            'SELECT accountId, accountName, email FROM ' + client.ACCOUNTS_TABLE +
                ' WHERE accountName = ?',
            [ req.params.username ],
            function (err, results) {
                req.send(results);
            }
        );
    });
  
}