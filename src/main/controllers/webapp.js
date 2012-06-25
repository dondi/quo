/**
 * webapp.js
 *
 * Controller responsible for handling the Quo webapp itself
 * (i.e., any URI that returns a web page).
 */
module.exports = function (app, database) {

    var loginIntercept = function (req, res, next) {
            // For now, just bail with forbidden.
            // TODO Redirect to a login page instead, and let the login go
            //      back here.
            if (req.session.user) {
                next();
            } else {
                res.send(403);
            }
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
    app.get("/main", loginIntercept, function (req, res) {
        res.render("main", {
            layout: true
        });
    });

    /*
     * GET /profile
     *   Redirects to the profile page of the current user
     */
    app.get("/profile", loginIntercept, function (req, res) {
        res.redirect("/profile/" + req.session.user);
    });

    /*
     * GET /profile/:username
     *   Renders the profile page for the given user
     */
    app.get("/profile/:username", loginIntercept, function (req, res) {
        if (req.session.user === req.params.username) {
            res.render('profile', {
                layout: true
            });
        } else {
            // TODO Handle user attempts to access another user differently.
            res.send(403);
        }
    });

};
