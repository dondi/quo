$(function () {
        // Hold a reference to the post-this button because we will use
        // it a lot.
    var postThis = $("#post-this"),

        disableButton = function () {
            postThis
                .addClass("disabled-or-inactive")
                .removeClass("hover-button")
                .unbind("click");    	
        },
        
        enableButton = function () {
            postThis
            	.unbind("click")
            	.click(sendStatus)
            	.removeClass("disabled-or-inactive")
                .addClass("hover-button");
        },
        
        // Name the sendStatus function so that we can use it later.
        sendStatus = function () {
            // Grab the current status.
            var statusText = $("#status").val(),
                filterConfig = "",
                status = {};
            
            // Go through each filter checkbox
            $("#filters")
                .children("input:checked")
                .each(function (index, element) {
                    filterConfig += $(this).val() + ",";
                });

            if (filterConfig) {
                filterConfig = filterConfig.substring(0, filterConfig.length - 1);
            }

            // Quick and dirty: an empty status is ignored.  What this should
            // really be is a dynamic disabling of the post-this button when
            // the text area is empty.
            if (!statusText) {
                return;
            }
            
            // Otherwise, construct the status object
            status = {
                message: statusText,
                filters: filterConfig
            };

            // Put up a little feedback.
            disableButton();
            
            // Make cursor pinwheel

            // Send the status post to the server.
            $.ajax({
                type: "POST",
                url: "/tweet",
                data: status,
                dataType: "json",

                success: function (result) {
                    // If something went wrong, data will have an error property.
                    if (result.error) {
                        $("#error-alert").fadeIn("slow");
                        $("#error-message").text(result.error);
                    }

                    // No matter what, clear things up for the next status post.
                    $("#status").val("").change();

                    // Get the button back in gear.                
                    // Unmake pinwheel into normal cursor
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        };

        
    $("#status").bind("input change", function() {
        $("#character-count").text($("#status").val().length);
        if (!($("#status").val())) {
            disableButton();
        } else {
            enableButton();
        }    
     }).change();

});
