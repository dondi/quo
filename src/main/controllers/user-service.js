/**
 * user-service.js
 *
 * Controller responsible for handling the user account and
 * administrative functions of Quo.
 */
module.exports = function (app, database) {

        // Imports.
    var sanitize = require("validator").sanitize,

        // Helper function to sanitize pre-DB layer user input.
        sanitizeAuthentication = function (userInput) {
            return (userInput !== sanitize(userInput).xss() && userInput.indexOf("'") === -1);
        },

        // Helper function for shipping out a created user.
        sendCreatedUser = function (res, createdUser) {
            // TODO Is there a way to build a URI in Node/Express?
            res.header("Location", "/users/" + createdUser.name);
            res.send(201);
        };

    /*
     * POST /
     *   Handles login credentials
     */
    // TODO This is *the* user authentication service, which means it belongs
    //      here.  However, "/" is probably not the best URI for it.
    app.post("/", function (req, res) {
        var inputs = req.body,
            user = inputs["user"],
            pass = inputs["pass"], // TODO: Should be hashed; can tackle later
            session = req.session;

        // Sanitize the user input before running through DB.
        if (sanitizeAuthentication(user) || sanitizeAuthentication(pass)) {
            res.send(false);
        } else {
            // Perform database check for authentication.
            database.authenticateCredentials(user, pass, function (result) {
                if (result) {
                    // The presence of the session.user property indicates that a user
                    // is currently logged in.
                    session.user = result[0];
                }
                res.send(result);
            });
        }
    });
  
    /*
     * GET /users
     *
     * Per REST, this URI should return the collection of all users in the
     * system.  TODO Decide on the credentials, if any, that are necessary
     *               for viewing this list.
     */
    app.get("/users", function (req, res) {
        database.query(
            "SELECT name FROM " + database.USER_TABLE,
            function (err, results) {
                // For every result, extract just the accountName into
                // an array and return that array.
                var names = [],
                    i,
                    max = results.length;

                for (i = 0; i < max; i += 1) {
                    names.push(results[i].name);
                }

                res.send(names);
            }
        );
    });

    /*
     * POST /users
     *
     * Creates a new user from the given payload.
     */
    app.post("/users", function (req, res) {
        var userToPost = req.body;

        // Make sure that the user does not have an ID.
        if (userToPost.id) {
            res.send("User overspecified", 400);
        } else {
            // Perform the creation.
            database.createOrUpdateUser(userToPost,
                // Send back the created response code, along with the URI of the new user.
                function (result, err) {
                    // The presence of an error trumps the result.
                    if (err) {
                        res.send(500);
                    } else if (result) {
                        sendCreatedUser(res, result);
                    } else {
                        res.send("Creation failed", 500);
                    }
                }
            );
        }
    });

    /*
     * GET /users/:username
     *
     * This URI returns a JSON representation of the user with the given
     * username.
     */
    app.get("/users/:username", function (req, res) {
        database.getUserByName(req.params.username,

            function (result) {
                res.send(result || 404);
            }
        );
    });

    /*
     * PUT /users/:username
     *
     * This URI replaces the user information in the database with the
     * corresponding data from the request payload.
     */
    app.put("/users/:username", function (req, res) {
        var userToPut = req.body;

        // First, check that the supplied information is consistent.
        if (userToPut.name === req.params.username) {
            database.createOrUpdateUser(userToPut,

                function (result, err) {
                    // The presence of an error trumps the result.
                    if (err) {
                        res.send(500);
                    } else if (result) {
                        sendCreatedUser(res, result);
                    } else {
                        res.send(204);
                    }
                }
            );
        } else {
            res.send("User inconsistent", 400);
        }
    });

};
