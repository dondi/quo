/**
 * db-config.js
 * 
 * Configures the Quo database client.
 */
module.exports = function (mysql) {
    // Create the database client.
    this.database = mysql.createClient({
        host: process.env.QUO_DB_SERVER,
        database: "quo"
    });

    // Check that the proper credentials have been set; otherwise, do not mess with database stuff.
    if (process.env.QUO_DB_USER && process.env.QUO_DB_PASS) {
        this.database.user = process.env.QUO_DB_USER;
        this.database.password = process.env.QUO_DB_PASS;
    } else {
        this.errors = "\n[X] Database user and/or password not found in environment.\n" +
                "[X] No database will be available to this process."
        return this;
    }

    // After the basics, we pass off to other files.
    require("./db/user.js")(this.database);

    return this;
};
