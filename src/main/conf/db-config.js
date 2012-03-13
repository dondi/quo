/**
 * db-config.js
 * 
 * Configures the ktah database on server start
 */

module.exports = function (client) {
  // Set up the accounts table
  client.query(
    'CREATE TABLE IF NOT EXISTS ' + client.ACCOUNTS_TABLE
    + '(accountId INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, '
    + 'accountName VARCHAR(255) NOT NULL, '
    + 'password VARCHAR(255) NOT NULL, '
    + 'email VARCHAR(255) NOT NULL, '
    + 'PRIMARY KEY (accountId))'
  );
  
  // Create the twitter accounts table
  client.query(
    'CREATE TABLE IF NOT EXISTS ' + client.TWIT_TABLE
    + '(accountId INT(11) UNSIGNED NOT NULL, '
    + 'profile TEXT NOT NULL, '
    + 'PRIMARY KEY (accountId))'
  );
  
  // Asynchronously executes the callback with the account Id, if
  // it exists, -1 otherwise 
  client.getAccountId = function (account, callback) {
    client.query(
      'SELECT accountName, accountId FROM ' + client.ACCOUNTS_TABLE + 
      ' WHERE accountName=?',
      [account],
      function (err, results, fields) {
        var result = (results && results.length !== 0) ? results[0].accountId : -1;
        callback(result);
      }
    );
  };
  
  // Creates a main user account with given credentials, triggering the callback
  // with the resultant id found for the user (-1 if new; id >= 1 otherwise)
  client.createAccount = function (user, pass, email, callback) {
    client.getAccountId(user, function (result) {
      if (result === -1) {
        client.query(
          "insert into " + client.ACCOUNTS_TABLE + " "
           + "set accountName = ?, "
           + "password = ?, "
           + "email = ?",
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
  client.getMediaProfile = function (id, media, callback) {
    client.query(
      'SELECT accountId, profile FROM ' + media + ' ' // Weird bug; cannot name media table except inline
       + 'WHERE accountId=?',
      [id],
      function (err, results, fields) {
        var result = (results && results.length !== 0) ? results[0].accountId : -1;
        callback(result);
      }
    );
  };
  
  // Creates a main user account with given credentials, triggering the callback
  // with the resultant id found for the user (-1 if new; id >= 1 otherwise)
  client.addMediaProfile = function (id, profile, media, callback) {
    client.getMediaProfile(id, media, function (result) {
      if (result === -1) {
        client.query(
          "insert into " + media + " " // Weird bug; cannot name media table except inline
           + "set accountId = ?, "
           + "profile = ?",
           [id, profile],
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
  
}
