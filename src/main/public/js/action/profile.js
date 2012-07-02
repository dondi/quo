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
            $("#user-name").val(result.name);
            $("#user-email").val(result.email);
        }
    );

    // Set up the Save Profile button to perform a PUT to the referenced user.
    // TODO This page should also be capable of performing a POST in order
    //      to create new users.
    $("#save-profile").click(function () {
        $.ajax(
            "/users/" + username,
            {
                type: "PUT",
                data: {
                    email: $("#user-email").val()
                },
                success: function (result) {
                    // TODO This can be much better  :)
                    alert("Done!");
                }
            }
        );
    });
});
