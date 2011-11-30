/**
 * pipeline-controller.js
 *
 * Controller responsible for handling the 
 * pipeline functionality of Quo.
 */

module.exports = function (app) {
	
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
  
}
