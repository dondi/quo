/**
 * login-display.js
 * 
 * Script for dealing with display elements in the
 * login screen.
 */
$(function () {
    // Set the focus on the login input
    $("#user").focus();
  
    // Checks given credentials with the DB and either displays an error or redirects
    $("#login-button").click(function () {
        var credentials = {
            user: $("#username").val(),
            pass: $("#password").val()
        };

        $.ajax({
            type: "POST",
            url: "/",
            data: credentials,

            success: function (result) {
                if (result) {
                    // TODO This needs to be integrated eventually with the /destinations
                    //      that are available to a user.
                    window.location = "./auth/twitter";
                } else {
                    $("#login-err")
                        .fadeIn(1000)
                        .delay(2000)
                        .fadeOut(1000);
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    });

});
