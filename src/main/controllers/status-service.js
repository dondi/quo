/**
 * status-service.js
 *
 * Controller responsible for handling the processing of status
 * updates in Quo.
 */
module.exports = function (app, database) {
        // Runs through the filter list with the given message
    var filterExec = function (message, filters) {
            var f, currentFilter;

            filters = filters.split(",");
            for (f in filters) {
                if (filters.hasOwnProperty(f)) {
                    currentFilter = app.BUILT_IN_FILTERS[filters[f]];
                    if (currentFilter) {
                        message = currentFilter(message);
                    }
                }
            }
            return message;
        };

    /*
     * POST /status
     */
    // TODO For the moment, status posting is very linear:
    //      - The initial string is run through a single sequence of filters
    //      - The final string is then posted to all available destinations
    //
    // Eventually, when we have a real pipeline implementation, the string will
    // actually flow through the entire pipeline, then possibly land at different
    // destinations at different points.
    app.post("/status", function (req, res) {
            // The data object.
        var data = req.body,

            // Fetch the user's status.
            originalPost = data["message"],
            filters = data["filters"],

            // Implement the filters given by the post.
            encodedPost = filterExec(originalPost, filters),

            // For use when iterating through destinations.
            destination;

        // Send the post to every available destination (see TODO above).
        for (destination in app.DESTINATIONS) {
            if (app.DESTINATIONS.hasOwnProperty(destination)) {
                app.DESTINATIONS[destination](encodedPost, req, res, database);
            }
        }
    });

};
