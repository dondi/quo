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
    database.ACCOUNTS_TABLE = "quo_accounts";
    database.USER_DESTINATION_TABLE = "quo_user_destination";

    // Set up the accounts table.
    database.query(
        "CREATE TABLE IF NOT EXISTS " + database.ACCOUNTS_TABLE +
                "(accountId INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, " +
                "accountName VARCHAR(255) NOT NULL, " +
                "password VARCHAR(255) NOT NULL, " +
                "email VARCHAR(255) NOT NULL, " +
                "PRIMARY KEY (accountId))"
    );

    // Create the user destination table.
    database.query(
        "CREATE TABLE IF NOT EXISTS " + database.USER_DESTINATION_TABLE +
                "(userId INT(11) UNSIGNED NOT NULL, " +
                "destination TEXT NOT NULL, " +
                "destinationId VARCHAR(255) NOT NULL, " +
                "profile TEXT NOT NULL, " +
                "FOREIGN KEY (userId) REFERENCES " + database.ACCOUNTS_TABLE + "(accountId), " +
                "PRIMARY KEY (userId, destinationId))"
    );

    // Asynchronously executes the callback with the account id, if
    // it exists, -1 otherwise.
    database.getAccountId = function (account, callback) {
        database.query(
            "SELECT accountName, accountId FROM " + database.ACCOUNTS_TABLE + 
                    " WHERE accountName = ?",

            [account],

            function (err, results, fields) {
                var result = (results && results.length) ? results[0].accountId : -1;
                callback(result);
            }
        );
    };

    // Asynchronously checks the accounts table for the given credentials and
    // returns a boolean denoting a match 
    database.authenticateCredentials = function (account, password, callback) {
        database.query(
            "SELECT accountName, accountId FROM " + database.ACCOUNTS_TABLE + 
                    " WHERE accountName=? and password = ?",

            [account, password],

            function (err, results, fields) {
                callback(((results && results.length) ? results : null));
            }
        );
    };

    // Creates a main user account with given credentials, triggering the callback
    // with the resultant id found for the user (-1 if new; id >= 1 otherwise)
    database.createAccount = function (user, pass, email, callback) {
        database.getAccountId(user, function (result) {
            if (result === -1) {
                database.query(
                    "insert into " + database.ACCOUNTS_TABLE + " " +
                            "set accountName = ?, " +
                            "password = ?, " +
                            "email = ?",

                    [user, pass, email],

                    function (err, results, fields) {
                        if (err) {
                            console.log(err);
                        }
                        callback(result);
                    }
                );
            }
        });
    };

    // Asynchronously executes the callback with the media Id, if
    // it exists, -1 otherwise
    database.findUserByDestinationAndDestinationId = function (destination, destinationId, callback) {
        database.query(
            "SELECT " + database.ACCOUNTS_TABLE + ".* FROM " +
                    database.ACCOUNTS_TABLE + " INNER JOIN " +
                    database.USER_DESTINATION_TABLE + " ON (" +
                    database.ACCOUNTS_TABLE + ".accountId = " +
                    database.USER_DESTINATION_TABLE + ".userId) " +
                    "WHERE destination = ? and destinationId = ?",

            [destination, destinationId],

            function (err, results, fields) {
                console.log("find called");
                console.log((results && results.length) ? results[0] : null);
                callback((results && results.length) ? results[0] : null);
            }
        );
    };

    // Asynchronously executes the callback with the media Id, if
    // it exists, -1 otherwise
    database.getMediaProfile = function (userId, destination, media, callback) {
        database.query(
            "SELECT userId, profile FROM " + media + " " + // Weird bug; cannot name media table except inline
                    "WHERE userId = ? and destination = ?",

            [userId, destination],

            function (err, results, fields) {
                callback((results && results.length) ? results[0].profile : null);
            }
        );
    };

    // Creates a main user account with given credentials, triggering the callback
    // with the resultant id found for the user (null if new; some profile if update)
    database.updateMediaProfile = function (userId, destination, destinationId, profile, media, callback) {
        database.getMediaProfile(userId, destination, media, function (result) {
            // Construct the query params so they can be changed easily if it"s an add vs update
            var queryConfig = [
                "insert into " + media + " " + // Weird bug; cannot name media table except inline
                        "set userId = ?, " +
                        "destination = ?, " +
                        "destinationId = ?, " +
                        "profile = ?",

                [userId, destination, destinationId, profile],

                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                    }
                    callback(result);
                }
            ];

            // If our getMediaProfile returned a profile, it must be an update, not an add.
            if (result) {
                queryConfig[0] = "update " + media + " " +
                        "set destinationId = ?, profile = ? " +
                        "where userId = ? and destination = ?";
                queryConfig[1] = [destinationId, profile, userId, destination];
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
