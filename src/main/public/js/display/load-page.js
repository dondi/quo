$(function () {
    // We're using .panel a lot, so save it.
    var panel = $(".panel");

    $(".back-panel")
        .offset(panel.offset())
        .width(panel.outerWidth())
        .height(panel.outerHeight())
        // Do not allow transitions until size has been set.
        .css({
            "transition-property": "all",
            "transition-duration": "10s"
        });

    panel.css({
        "opacity": "1.0",
        "transform": "rotate3d(0, 1, 0, 0deg)",
        "-moz-transform": "rotate3d(0, 1, 0, 0deg)",
        "-webkit-transform": "rotate3d(0, 1, 0, 0deg)"
    });

    $(".back-panel").css({
        "transform": "rotate3d(0, 1, 0, 180deg)",
        "-moz-transform": "rotate3d(0, 1, 0, 180deg)",
        "-webkit-transform": "rotate3d(0, 1, 0, 180deg)"
    });
});
