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

    // Customize the logout routine.  This is what gets called upon
    //   GET /logout
    everyauth.everymodule.handleLogout(function (req, res) {
        var handler = this;

        req.logout();
        req.session.destroy(function () {
            handler.redirect(res, handler.logoutRedirectPath());
        });
    });

    // Load up the known destination implementations.
    require("./destinations/twitter.js")(everyauth, this);
    require("./destinations/facebook.js")(everyauth, this);

    return this;
};
