/**
 * function-service.js
 *
 * Controller responsible for handling the 
 * function service functionality of Quo.
 *
 * In Quo, "functions" are JavaScript functions that accept an input status
 * string, transforms that string somehow, then returns the result.
 */
module.exports = function (app, client) {
  var // TODO This is duplicated in status-service.js.  This has to be pulled
      //      out and unified into a shared native function library.

      // Message filter to remove hash tags
      filterNoHash = function (message) {
        var rawMessage = message.split(" "),
            result = [];
        for (var i = 0; i < rawMessage.length; i++) {
          if (rawMessage[i].charAt(0) !== "#") {
            result.push(rawMessage[i]);     
          }
        }
        return result.join(" ");
      },
      
      // Message filter to turn it all uppercase
      filterYell = function (message) {
        return message.toUpperCase();
      },
      
      // Message filter to truncate for Twitter
      filterTruncate = function (message) {
        return message.substring(0, 137) + ((message.length > 140) ? "..." : "");
      },
      
      // Contains the list of filters to be used
      filterHash = {
        "filterNoHash": filterNoHash,
        "filterYell": filterYell,
        "filterTruncate": filterTruncate
      };

    /*
     * GET /functions?q={search term}
     *   [TODO put the functions in the database]
     */
    app.get('/functions', function (req, res) {
        var key, response = [];

        for (key in filterHash) {
            // Check if a query was made on the get.
            if (!req.query.q || key.indexOf(req.query.q) !== -1) {
                response.push(key);
            }
        }

        res.send(response);
    });

    /*
     * GET /functions/:id
     *   [TODO put the functions in the database]
     */
    app.get('/functions/:id', function (req, res) {
        res.send(filterHash[req.params.id].toString());
    });
  
}