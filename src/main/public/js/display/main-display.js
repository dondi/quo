/**
 * main-display.js
 * 
 * Script for dealing with display elements in the
 * main screen.
 */

$(function () {
  $("#twitter-button")
    .click(function () {
      window.location = "../auth/twitter";
    });
});
