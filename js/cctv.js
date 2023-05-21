$(document).ready(function () {
    var elements = ["#single_1", "#single_2", "#single_3", "#single_4", "#single_5"];

    for (var i = 0; i < elements.length; i++) {
        $(elements[i]).fancybox({
            openEffect: 'none',
            closeEffect: 'none',
            helpers: {
                title: {
                    type: 'outside'
                }
            }
        });
    }
});