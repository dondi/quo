/*
 * Companion JavaScript file for the Quo profile web page.
 */
$(function () {
    // Grab the requested username; this is the last element of the
    // page URL.
    var username = window.location.pathname.split("/").pop();

    $.getJSON(
        "/users/" + username,
        function (result) {
            $("#user-name").val(result.accountName);
            $("#user-email").val(result.email);
        }
    );
});
