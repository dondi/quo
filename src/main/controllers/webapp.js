/**
 * webapp.js
 *
 * Controller responsible for handling the Quo webapp itself
 * (i.e., any URI that returns a web page).
 */
module.exports = function (app, database) {

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
    app.get('/main', function (req, res) {
        res.render('main', {
            layout: true
        });
    });

    /*
     *  GET /profile
     *  renders the profile screen
     */
    app.get('/profile/:username', function (req, res) {
	    res.render('profile', {
            layout: true
        });
    });

};
