$(document).ready(function () {

    $(".three_change").on("change", function () {
        $(".time_group").hide();
    });

    //自訂
    $(".custom").on("change", function () {
        $(".time_group").show();
    });
    
    


    $('.nav-item').click(function () {
        console.log("12132");
        // 移除当前所有具有active类的导航项
        $('.nav-item').removeClass('active');
        // 将被点击的导航项添加active类
        $(this).addClass('active');
    });

})