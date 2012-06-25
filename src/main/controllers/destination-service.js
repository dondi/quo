/**
 * destination-service.js
 *
 * Controller responsible for handling the 
 * destination service functionality of Quo.
 *
 * In Quo, "destinations" are possible recipients of a Quo status post
 * (e.g., Twitter, Facebook, etc.).  They implement the posting API of
 * that recipient.
 */
module.exports = function (app, database) {

    /*
     * GET /destinations
     */
    app.get("/destinations", function (req, res) {
        res.send(app.DESTINATIONS);
    });
  
};
