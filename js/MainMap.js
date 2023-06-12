$(function () {
    var screen_height = $(window).height();
    var screen_width = $(window).width();
    //  alert(screen_height + "px");

    $("#iframe_map").height((screen_height-88) + "px");
    $("#iframe_map").width(screen_width + "px");

    $("#li1").on("click", function () {

        
        window.open("Main.aspx?a=0", "_parent");

    });
    $("#li3").on("click", function () {

        window.open("Main.aspx?a=2", "_parent");


    });
    $("#li4").on("click", function () {

        window.open("Main.aspx?a=3", "_parent");


    });
});