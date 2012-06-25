/**
 * destination-config.js
 *
 * Configures the available status post destinations for Quo.
 */
module.exports = function (everyauth) {
    // Initialize the collection of destinations and their corresponding
    // status-posting functions.
    this.destinations = {};

    // Initialize the error string.
    this.errors = "";

    // Load up the known destination implementations.
    require("./destinations/twitter.js")(everyauth, this);
    require("./destinations/facebook.js")(everyauth, this);

    return this;
};
