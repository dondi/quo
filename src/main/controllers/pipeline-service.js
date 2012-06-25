/**
 * pipeline-service.js
 *
 * Controller responsible for handling the 
 * pipeline service functionality of Quo.
 */
module.exports = function (app, client) {

  /*
   * GET /pipelines
   *   [TODO]
   */
  app.get('/pipelines', function (req, res) {
        res.send("This service is not yet implemented.", 500);

    // Check if a query was made on the get
    
    /*
     * GET /pipelines?user={username}
     *   [TODO]
     */
  });
  
  /*
   * GET /pipelines/:id
   *   [TODO]
   */
  app.get('/pipelines/:id', function (req, res) {
        res.send("This service is not yet implemented.", 500);
  });
  
};
