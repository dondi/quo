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
            })
            element.mousedown(function(event) { 
                buttonPress = 1; 
                mouseIsOut = 0;
                press(element);
            }).mouseout(function(event) {
                if (buttonPress) {
                    unpress(element);
                }
                mouseIsOut = 1;
            }).mouseenter(function(event) {
                if (buttonPress) {
                    press(element); 
                }
                mouseIsOut = 0;
            }).mouseup(function(event) {
                if (buttonPress) {
                    unpress(element); 
                    click();
                }
                buttonPress = 0;
            });
        }
    };
    
    /** Precondition: divs used as checkboxes have to already be given size */
    Checkbox = {
            ify: function(element1, element2, press, unpress, click) {
                var buttonPress = 0,
                    mouseIsOut = 0;
                
                $("html").mouseup(function(event) {
                    if (mouseIsOut) {
                        if (checkboxValue) {
                            press(element2);
                        }
                        buttonPress = 0;
                    }
                });
                element1.mousedown(function(event) { 
                    buttonPress = 1; 
                    mouseIsOut = 0;
                    press(element2);
                }).mouseout(function(event) {
                    if (buttonPress) {
                        unpress(element2);
                    }
                    mouseIsOut = 1;
                }).mouseenter(function(event) {
                    if (buttonPress) {
                        press(element2); 
                    }
                    mouseIsOut = 0;
                }).mouseup(function(event) {
                    if (buttonPress) {
                        unpress(element2); 
                        click(element2);
                    }
                    buttonPress = 0;
                });
                element2.mousedown(function(event) { 
                    buttonPress = 1; 
                    mouseIsOut = 0;
                    press(element2);
                }).mouseout(function(event) {
                    if (buttonPress) {
                        unpress(element2);
                    }
                    mouseIsOut = 1;
                }).mouseenter(function(event) {
                    if (buttonPress) {
                        press(element2); 
                    }
                    mouseIsOut = 0;
                }).mouseup(function(event) {
                    if (buttonPress) {
                        unpress(element2); 
                        click(element2);
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
                e.addClass("hip-button-press")
                 .addClass("hip-button-press-login");
            }, 
            
            function(e) { 
                e.removeClass("hip-button-press")
                 .removeClass("hip-button-press-login");
            },
             
            function() {
            });

    Button.ify($("#post-this"), 
            function(e) { 
                e.addClass("hip-button-press")
                 .addClass("hip-button-press-main");
            }, 
            
            function(e) { 
                e.removeClass("hip-button-press")
                 .removeClass("hip-button-press-main");
            },
             
            function() {
            });
    
    /** Use of checkbox function for YELL-IT modifications */
    Checkbox.ify($("#yell-it-label"), $("#yell-it-box"),
            function(e) {
    	    /* What happens when the checkbox is pressed or held-down */
                e.addClass("hip-checkbox-press"); 
            },
            
            function(e) {
            /* What happens when someone mouses away and/or lets go out side the checkbox area */
                e.removeClass("hip-checkbox-press"); 
            },
            
            function(e) {
            /* What happens when the button is clicked (i.e. pressed down and released inside the checkbox area */
                if (!checkboxValue) {
                	/* The checkbox has been checked */
                    e.addClass("hip-checkbox-press"); 
                    e.html('&#x2713;'); 
                    checkboxValue = 1;
                } else {
                	/* The checkbox has been unchecked */
                    e.removeClass("hip-button-press");
                    e.html(''); 
                    checkboxValue = 0;
                }
            }
        );   

    /** Use of checkbox function for Trunkify modifications */
    /* Not yet working, some kind of kink when I have two checkboxes */
    /*
    Checkbox.ify($("#trunkify-label"), $("#trunkify-box"),
            function(e) {
                e.addClass("hip-checkbox-press"); 
            },
            
            function(e) {
                e.removeClass("hip-checkbox-press"); 
            },
            
            function(e) {
                if (!checkboxValue) {
                    e.addClass("hip-checkbox-press"); 
                    e.html('&#x2713;'); 
                    checkboxValue = 1;
                } else {
                    e.removeClass("hip-checkbox-press");
                    e.html(''); 
                    checkboxValue = 0;
                }
            }
        );   */
    
});