$(function () {
        // Hold a reference to the post-this button because we will use
        // it a lot.
    var postThis = $("#post-this"),

        // Name the sendStatus function so that we can use it later.
        sendStatus = function () {
            // Grab the current status.
            var statusText = $("#status").val();

            // Quick and dirty: an empty status is ignored.  What this should
            // really be is a dynamic disabling of the post-this button when
            // the text area is empty.
            if (!statusText) {
                return;
            }

            // Put up a little feedback.
            postThis
                .addClass("disabled-or-inactive")
                .unbind("click");

            // Send the status post to the server.
            $.getJSON("/tweet/" + encodeURIComponent($("#status").val()), function (data) {
                console.log(JSON.stringify(data));
                // If something went wrong, data will have an error property.
                if (data.error) {
                    $("#error-alert").fadeIn("slow");
                    $("#error-message").text(data.error);
                }

                // No matter what, clear things up for the next status post.
                $("#status").val("").change();

                // Get the button back in gear.
                postThis
                    .click(sendStatus)
                    .removeClass("disabled-or-inactive");
            });
        };

    postThis.click(sendStatus);
});
