/**
 * function-service.js
 *
 * Controller responsible for handling the 
 * function service functionality of Quo.
 *
 * In Quo, "functions" are JavaScript functions that accept an input status
 * string, transforms that string somehow, then returns the result.
 */
module.exports = function (app, database) {
    var // These filters are "built-in;" i.e., they are stored in memory and not
        // in the database.

        // Message filter to remove hash tags.
        filterNoHash = function (message) {
            var rawMessage = message.split(" "),
                result = [],
                i,
                max = rawMessage.length;

            for (i = 0; i < max; i += 1) {
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
        };

    // This is the list of "built-in" (i.e., in-memory) filters.  This is assigned
    // to the app parameter so that it can be shared with other controllers.
    app.BUILT_IN_FILTERS = {
        "filterNoHash": filterNoHash,
        "filterYell": filterYell,
        "filterTruncate": filterTruncate
    };

    /*
     * GET /functions?q={search term}
     *   [TODO put the functions in the database]
     */
    app.get("/functions", function (req, res) {
        var key, response = [];

        for (key in app.BUILT_IN_FILTERS) {
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
    app.get("/functions/:id", function (req, res) {
        res.send(app.BUILT_IN_FILTERS[req.params.id].toString());
    });
  
};
