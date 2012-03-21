$(function () {

	var Button,
        Checkbox,
        checkboxValue = 0;
        
    /** Buttonify will make a div space act like a button in whichever way you specify.
        Precondition: you call the button within a mousedown() on the element involved.
          You need to pass in the element as an argument, as well as the functions that
          specify what actions should be performed as "press" and "unpress".
    */
    
    
    Button = {
        ify: function(element, press, unpress, click) {
            var buttonPress = 0,
                mouseIsOut = 0;
            
            $("html").mouseup(function(event) {
                if (mouseIsOut) {
                    buttonPress = 0;
                }
                console.log("button mouseup in body ");
            })
            element.mousedown(function(event) { 
                buttonPress = 1; 
                mouseIsOut = 0;
                press(element);
                console.log("blue mousedown");
            }).mouseout(function(event) {
                if (buttonPress) {
                    unpress(element);
                    console.log("notBlue mouseout");
                }
                mouseIsOut = 1;
            }).mouseenter(function(event) {
                if (buttonPress) {
                    press(element); 
                    console.log("blue mouseenter");
                }
                mouseIsOut = 0;
            }).mouseup(function(event) {
                if (buttonPress) {
                    unpress(element); 
                    click();
                    console.log("mouseup and notBlue, button press signifies action. ");
                }
                buttonPress = 0;
            });
        }
    };

    
    /** Things the buttons will do when pressed, unpressed, or clicked */
    /** Error message alert exit button */
    Button.ify($("#error-exit"), 
        function(e) { 
            e.addClass("error-button-press"); 
        }, 
        
        function(e) { 
            e.removeClass("error-button-press"); 
        },
         
        function() {
    		$("#error-alert").fadeOut("fast");
        });
    
    Button.ify($("#login-button"), 
            function(e) { 
                e.addClass("hip-button-press"); 
            }, 
            
            function(e) { 
                e.removeClass("hip-button-press"); 
            },
             
            function() {
            });

    Button.ify($("#post-this"), 
            function(e) { 
                e.addClass("hip-button-press"); 
            }, 
            
            function(e) { 
                e.removeClass("hip-button-press"); 
            },
             
            function() {
            });

});