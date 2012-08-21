/**
 * user.js
 *
 * Contains database code pertaining to the user domain object and data access.
 *
 * TODO Many of these functions need to be renamed, for consistency with
 *      the service URIs and with Quo documentation.
 */
module.exports = function (database) {
    // Assign some useful public values.
    database.USER_TABLE = "quo_user";
    database.USER_DESTINATION_TABLE = "quo_user_destination";

    // Set up the accounts table.
    database.query(
        "CREATE TABLE IF NOT EXISTS " + database.USER_TABLE +
                "(id INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, " +
                "name VARCHAR(255) NOT NULL UNIQUE, " +
                "password VARCHAR(255) NOT NULL, " +
                "email VARCHAR(255) NOT NULL, " +
                "PRIMARY KEY (id))"
    );

    // Create the user destination table.
    database.query(
        "CREATE TABLE IF NOT EXISTS " + database.USER_DESTINATION_TABLE +
                "(userId INT(11) UNSIGNED NOT NULL, " +
                "destination TEXT NOT NULL, " +
                "destinationId VARCHAR(255) NOT NULL, " +
                "profile TEXT NOT NULL, " +
                "FOREIGN KEY (userId) REFERENCES " + database.USER_TABLE + "(id), " +
                "PRIMARY KEY (userId, destinationId))"
    );

    // Asynchronously executes the callback with the user, if
    // it exists, null otherwise.
    database.getUserByName = function (name, callback) {
        database.query(
            "SELECT name, email FROM " + database.USER_TABLE + 
                    " WHERE name = ?",

            [name],

            function (err, results, fields) {
                callback((results && results.length) ? results[0] : null);
            }
        );
    };

    // Asynchronously executes the callback with the full user, if
    // it exists, null otherwise.  This includes the password, so should
    // not be externally accessible.
    database._getFullUserByName = function (name, callback) {
        database.query(
            "SELECT * FROM " + database.USER_TABLE + 
                    " WHERE name = ?",

            [name],

            function (err, results, fields) {
                callback((results && results.length) ? results[0] : null);
            }
        );
    };

    // Asynchronously checks the accounts table for the given credentials and
    // returns a boolean denoting a match 
    database.authenticateCredentials = function (name, password, callback) {
        database.query(
            "SELECT id, name, email FROM " + database.USER_TABLE + 
                    " WHERE name = ? and password = ?",

            [name, password],

            function (err, results, fields) {
                callback(((results && results.length) ? results : null));
            }
        );
    };

    // Creates a main user account with given credentials, triggering the callback
    // with the resultant id found for the user (-1 if new; id >= 1 otherwise)
    database.createOrUpdateUser = function (user, callback) {
        database._getFullUserByName(user.name, function (result) {
            // Construct the query params so they can be changed easily if it's a create vs. an update.
            var queryConfig = [
                "INSERT INTO " + database.USER_TABLE + " " +
                            "SET name = ?, " +
                            "password = ?, " +
                            "email = ?",

                [user.name, user.password, user.email],

                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        // For an insertion, we need to return the inserted user.
                        database.getUserByName(user.name, function (createdUser) {
                            callback(createdUser);
                        });
                    }
                }
            ];

            // If our get call returned a user object, it must be an update, not an add.
            if (result) {
                queryConfig[0] = "UPDATE " + database.USER_TABLE + " " +
                        "SET name = ?, password = ?, email = ? " +
                        "WHERE id = ?";

                // password is an optional property for the incoming object.
                queryConfig[1] = [user.name, user.password || result.password, user.email, result.id];

                queryConfig[2] = function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        // A successful update should return no content.
                        callback(null);
                    }
                };
            }

            // Execute the query, whether it was an update or add.
            database.query(
                queryConfig[0],
                queryConfig[1],
                queryConfig[2]
            );
        });
    };

    // Asynchronously executes the callback with the user destination, if
    // it exists, null otherwise.
    database.getUserByDestinationAndDestinationId = function (destination, destinationId, callback) {
        database.query(
            "SELECT " + database.USER_TABLE + ".* FROM " +
                    database.USER_TABLE + " INNER JOIN " +
                    database.USER_DESTINATION_TABLE + " ON (" +
                    database.USER_TABLE + ".id = " +
                    database.USER_DESTINATION_TABLE + ".userId) " +
                    "WHERE destination = ? and destinationId = ?",

            [destination, destinationId],

            function (err, results, fields) {
                callback((results && results.length) ? results[0] : null);
            }
        );
    };

    // Asynchronously executes the callback with the user destination profile, if
    // it exists, null otherwise.
    database.getUserDestinationProfileByUserId = function (userId, destination, callback) {
        database.query(
            "SELECT userId, profile FROM " + database.USER_DESTINATION_TABLE + " " +
                    "WHERE userId = ? AND destination = ?",

            [userId, destination],

            function (err, results, fields) {
                callback((results && results.length) ? results[0].profile : null);
            }
        );
    };

    // Creates a main user account with given credentials, triggering the callback
    // with the resultant id found for the user (null if new; some profile if update)
    database.createOrUpdateUserDestinationProfile = function (userId, destination, destinationId, profile, callback) {
        database.getUserDestinationProfileByUserId(userId, destination, function (result) {
            // Construct the query params so they can be changed easily if it's a create vs. an update.
            var queryConfig = [
                "INSERT INTO " + database.USER_DESTINATION_TABLE + " " +
                        "SET userId = ?, " +
                        "destination = ?, " +
                        "destinationId = ?, " +
                        "profile = ?",

                [userId, destination, destinationId, profile],

                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                    }

                    // For an insertion, we need to return the inserted user.
                    database.getUserDestinationProfileByUserId(
                        userId, destination,

                        function (createdUserDestinationProfile) {
                            callback(createdUserDestinationProfile);
                        }
                    );
                }
            ];

            // If our get call returned a profile, it must be an update, not an add.
            if (result) {
                queryConfig[0] = "UPDATE " + database.USER_DESTINATION_TABLE + " " +
                        "SET destinationId = ?, profile = ? " +
                        "WHERE userId = ? AND destination = ?";

                queryConfig[1] = [destinationId, profile, userId, destination];

                queryConfig[2] = function (err, results, fields) {
                    if (err) {
                        console.log(err);
                    }

                    // A successful update should return no content.
                    callback(null);
                };
            }

            // Execute the query, whether it was an update or add.
            database.query(
                queryConfig[0],
                queryConfig[1],
                queryConfig[2]
            );
        });
    };

};
