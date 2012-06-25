/**
 * webapp.js
 *
 * Controller responsible for handling the Quo webapp itself
 * (i.e., any URI that returns a web page).
 */
module.exports = function (app, database) {

    var loginIntercept = function (req, res) {
            // For now, just bail with forbidden.
            // TODO Redirect to a login page instead, and let the login go
            //      back here.
            res.send(403);
        };

    /*
     * GET /
     *   Renders the login index
     */
    app.get('/', function (req, res) {
        res.render('index', {
            layout: true
        });
    });

    /*
     * GET /main
     *   Renders the main screen
     */
    app.get("/main", function (req, res) {
        if (req.session.user) {
            res.render("main", {
                layout: true
            });
        } else {
            loginIntercept(req, res);
        }
    });

    /*
     * GET /profile
     *   Redirects to the profile page of the current user
     */
    app.get("/profile", function (req, res) {
        if (req.session.user) {
            res.redirect("/profile/" + req.session.user);
        } else {
            loginIntercept(req, res);
        }
    });

    /*
     * GET /profile/:username
     *   Renders the profile page for the given user
     */
    app.get("/profile/:username", function (req, res) {
        if (req.session.user === req.params.username) {
            res.render('profile', {
                layout: true
            });
        } else {
            loginIntercept(req, res);
        }
    });

    /*
     * GET /bye
     *   Logs out the current user then redirects to the login page
     */
    app.get("/bye", function (req, res) {
        req.session.destroy(function () {
            res.redirect("/");
        });
    });

};
