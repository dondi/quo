/**
 * pipeline-controller.js
 *
 * Controller responsible for handling the 
 * pipeline functionality of Quo.
 */

module.exports = function (app) {
  var https = require('https');
  
  /*
   * GET /pipelines
   *   [TODO]
   */
  app.get('/pipelines', function (req, res) {
    // Check if a query was made on the get
    if (!req.query.username) {
      res.render('index', {
        layout: true
      });
    
    /*
     * GET /pipelines?user={username}
     *   [TODO]
     */
    } else {
      
    }
  });
  
  
  /*
   * GET /pipelines/:id
   *   [TODO]
   */
  app.get('/pipelines/:id', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  
  /*
   * GET /functions
   *   [TODO]
   */
  app.get('/functions', function (req, res) {
    // Check if a query was made on the get
    if (!req.query.q) {
      res.render('index', {
        layout: true
      });
    
    /*
     * GET /pipelines?q={search term}
     *   [TODO]
     */
    } else {
      
    }
  });
  
  
  /*
   * GET /functions/:id
   *   [TODO]
   */
  app.get('/functions/:id', function (req, res) {
    res.render('index', {
      layout: true
    });
  });
  
  
  /*
   * POST /tweet/:message
   *   [TODO]
   */
  app.post('/tweet/:message', function (req, res) {
    //res.send('You said: ' + req.params.message);
    var authInfo = "";
    var post_req = https.request({
      host: 'api.twitter.com',
      port: '443',
      path: '/1/statuses/update.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 0, // Need an actual length here
        'Authorization': authInfo
      }
    },
    function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
      });
    });
    
    post_req.write(tester);
    post_req.end();
  });
  
}
