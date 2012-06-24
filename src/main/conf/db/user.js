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
    database.TWIT_TABLE = "quo_twit"; // TODO might need to move?

    // Set up the accounts table.
    database.query(
        "CREATE TABLE IF NOT EXISTS " + database.ACCOUNTS_TABLE +
                "(accountId INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, " +
                "accountName VARCHAR(255) NOT NULL, " +
                "password VARCHAR(255) NOT NULL, " +
                "email VARCHAR(255) NOT NULL, " +
                "PRIMARY KEY (accountId))"
    );

    // Create the twitter accounts table
    database.query(
        "CREATE TABLE IF NOT EXISTS " + database.TWIT_TABLE +
                "(accountId INT(11) UNSIGNED NOT NULL, " +
                "profile TEXT NOT NULL, " +
                "PRIMARY KEY (accountId))"
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
    database.getMediaProfile = function (id, media, callback) {
        database.query(
            "SELECT accountId, profile FROM " + media + " " + // Weird bug; cannot name media table except inline
                    "WHERE accountId=?",

            [id],

            function (err, results, fields) {
                var result = (results && results.length) ? results[0].profile : null;
                callback(result);
            }
        );
    };

    // Creates a main user account with given credentials, triggering the callback
    // with the resultant id found for the user (null if new; some profile if update)
    database.updateMediaProfile = function (id, profile, media, callback) {
        database.getMediaProfile(id, media, function (result) {
            // Construct the query params so they can be changed easily if it"s an add vs update
            var queryConfig = [
                "insert into " + media + " " + // Weird bug; cannot name media table except inline
                        "set accountId = ?, " +
                        "profile = ?",

                [id, profile],

                function (err, results, fields) {
                    if (err) {
                        console.log(err);
                    }
                    callback(result);
                }
            ];

            // If our getMediaProfile returned a profile, it must be an update, not an add.
            if (result) {
                queryConfig[0] = "update " + media + " set profile = ? where accountId = ?";
                queryConfig[1] = [profile, id];
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
