/*
 * Companion JavaScript file for the Quo profile web page.
 */
$(function () {
    // Grab the requested username; this is the last element of the
    // page URL.
    var username = window.location.pathname.split("/").pop();
    console.log(username);

    $.getJSON(
        "/users/" + username,
        function (result) {
            $("#name").val(result.name);
            $("#email").val(result.email);
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
                    email: $("#email").val()
                },
                success: function (result) {
                    // TODO How does one retrieve ReST status?
                    console.log("profile updated");
                }
            }
        );
    });
    
    // Set up the Create profile button to perform a PUT to the newly created
    // user. TODO still have to figure out the POST part of user creation.
    $("#create-profile").click(function () {
        username = $("#username").val();
        $.ajax(
            "/users/" + username,
            {
                type: "PUT",
                data: {
                    email: $("#email").val()
                    password: $("#password").val()
                },
                success: function (result) {
                    // TODO This can be much better  :)
                    console.logt("profile created");
                }
            }
        );
    });



});
