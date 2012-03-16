/**
 * main-display.js
 * 
 * Script for dealing with display elements in the
 * main screen.
 */

$(function() {
    $("#status").bind('input change', function() {
        $("#character-count").text( $("#status").val().length );
        if ( ($("#status").val().length) >= 144 ) {
            $("#twitter-check").attr("disabled", "disabled");
        } else {
            $("#twitter-check").removeAttr("disabled");
        }    });
});