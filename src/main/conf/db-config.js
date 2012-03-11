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
  
  // Create the media table
  client.query(
    'CREATE TABLE IF NOT EXISTS ' + client.TWIT_TABLE
    + '(accountId INT(11) UNSIGNED NOT NULL AUTO_INCREMENT, '
    + 'twit_user TEXT NOT NULL, '
    + 'PRIMARY KEY (accountId))'
  );
  
  // Returns the account id, or -1 if it does not exist
  client.getAccountId = function (account) {
    client.query(
      'SELECT accountName, id FROM ' + client.ACCOUNTS_TABLE + 
      ' WHERE accountName=?',
      [account],
      function (err, results, fields) {
        return (results.length !== 0) ? results[0].id : -1;
      }
    );
  };
  
  // Creates a main user account with given credentials
  client.createAccount = function (user, pass, email) {
    var alreadyExists = (client.getAccountId(user) !== -1);
    if (alreadyExists) {
      client.query(
        "insert into " + client.ACCOUNTS_TABLE + " "
         + "set accountName = ?, "
         + "password = ?, "
         + "email = ?",
         [user, pass, email]
      );
    }
    
    // True if the add was successful; false if already exists
    return alreadyExists;
  };
  
}
