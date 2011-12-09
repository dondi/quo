/**
 * account-controller.js
 *
 * Controller responsible for handling the account and
 * administrative functions of Quo.
 */

module.exports = function (app, client) {
	
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
   * POST /
   *   Handles login credentials
   */
  app.post('/', function (req, res) {
    res.redirect('/main');
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
   * GET /users
   *   [TODO]
   */
  app.get('/users', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  
  /*
   * GET /users/:username
   *   [TODO]
   */
  app.get('/users/:username', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
}
