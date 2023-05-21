
$(document).ready(function () {
    $("#btnRainQuery").on("click", function () {
        var type = $('input[name*=rain_options]:checked').val()
        var ST_No = $("#rain_station").val();
        // alert("RainQuery : " + type)

        //rain_highchart()
        var date_start = $("#rain_date_start").val();
        var date_end = $("#rain_date_end").val();

        if (date_start == "" || date_end == "") {
            if (date_start == "") {
                alert("請輸入起迄時間");
            }
            if (date_end == "") {
                alert("請輸入結束時間");
            }
        } else {
            if (GetDateDiff(date_start, date_end, "day") > 13) {
                alert("自訂時間查詢範圍最多為14天，請重新查詢！");
                return;
            }
        }
    });


    // $("#rain_option1").on("change", function () {
    //     $("#rain_group").hide();
    // });

    // $("#rain_option2").on("change", function () {
    //     $("#rain_group").hide();
    // });

    // $("#rain_option3").on("change", function () {
    //     $("#rain_group").hide();
    // });

    //自訂
    // $("#rain_option4").on("change", function () {
    //     $("#rain_group").show();
    // });



})

function setdatepicker_rain(startDate, endDate) {

    if (startDate == "" && endDate == "") {
        $("#rain_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            //startDate: "2019-01-01",
            //endDate: "2020-01-01",
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#rain_date_end").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            //startDate: "2019-01-01",
            //endDate: "2020-01-01",
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
    } else {
        $("#rain_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#rain_date_end").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
    }

}

