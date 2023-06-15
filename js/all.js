$(document).ready(function () {

    $(".three_change").on("change", function () {
        $(".time_group").hide();
    });

    //自訂
    $(".custom").on("change", function () {
        $(".time_group").show();
    });
    
    
})