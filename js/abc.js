
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
            RainHighChartData(ST_No, type, date_start, date_end, true);
        }
    });


    $("#rain_option1").on("change", function () {
        $("#rain_group").hide();

        var type = $('input[name*=rain_options]:checked').val()
        var ST_No = $("#rain_station").val();
        // alert("RainQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        RainHighChartData(ST_No, type, date_start, date_end, true);

    });
    $("#rain_option2").on("change", function () {
        $("#rain_group").hide();
        var type = $('input[name*=rain_options]:checked').val()
        var ST_No = $("#rain_station").val();
        // alert("RainQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        RainHighChartData(ST_No, type, date_start, date_end, true);

    });
    $("#rain_option3").on("change", function () {
        $("#rain_group").hide();
        var type = $('input[name*=rain_options]:checked').val()
        var ST_No = $("#rain_station").val();
        // alert("RainQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        RainHighChartData(ST_No, type, date_start, date_end, true);

    });

    //自訂
    $("#rain_option4").on("change", function () {
        $("#rain_group").show();
    });

    $("#rain_station").on("change", function () {
        var ST_No = $("#rain_station").val();
        var date_start = '';
        var date_end = '';
        var type = $('input[name*=rain_options]:checked').val()
        RainHighChartData(ST_No, type, date_start, date_end, true);

    });

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

//設定Rain資料
function SetMonitorRain() {

    //設定 站台 資料
    var request = $.ajax({
        url: STATION_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        // alert(msg);
        let iMove = JSON.parse(msg);
        move_json = "";
        if (iMove.success) {
            move_json = msg;
            $("#rain_station").html("");//清掉測站的資料
            //重新填入測站名稱
            var ST_NO = "";
            for (var i = 0; i < iMove.message.length; i++) {
                if (iMove.message[i].Rain) {
                    if (ST_NO == "") {
                        ST_NO = iMove.message[i].ST_NO;
                    }
                    $("#rain_station").append($("<option></option>").attr("value", iMove.message[i].ST_NO).text(iMove.message[i].NAME_C));
                }
            }
            //Rain01

            ST_NO = '19-RA1';
            var type = $('input[name*=rain_options]:checked').val()
            $("#rain_station").val(ST_NO);


            RainHighChartData(ST_NO, type, '', '')



        } else {

            alert(iMove.message);
        }

    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
    //設定 站台 資料 尾

}
function RainHighChartData(ST_No, type, date_start, date_end, isQuery) {

    if (isQuery === undefined) {
        isQuery = false;
    }

    //alert(ST_No + "," + type + "," + date_start + "," + date_end);
    var request = $.ajax({
        url: RainHighChartData_URL,
        data: {
            ST_No: encodeURI(ST_No),
            type: encodeURI(type),
            date_start: encodeURI(date_start),
            date_end: encodeURI(date_end)
        },
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        //alert(msg);

        let iRainData = JSON.parse(msg);

        //if (iRainData.success) {

            rain_highchart(iRainData.message[0].NAME_C, iRainData)


        //} else {
        //    if (isQuery) {
        //        rain_highchart(ST_No, iRainData)
        //        alert(iRainData.message);
        //    }
        //}




    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
}

//設定雨量資料
function SetRainTable() {

    var request = $.ajax({
        url: RAIN_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        //alert(msg);
        let iRain = JSON.parse(msg);
        rain_json = "";
        if (iRain.success) {
            rain_json = msg;
            //let iObj = JSON.parse(iRain.message);
            //let iObj = JSON.parse(JSON.stringify(iRain.message));
            // alert(iRain.message.min_10.length);
            var rain_top_table = "";
            var rain_bottom_table = "";

            var top_row = 0;
            var bottom_row = 0;

            for (var i = 0; i < iRain.message.min_10.length; i++) {
                if (iRain.message.min_10[i].PLAN_IN && iRain.message.min_10[i].Rain)//PLAN_IN ='1' AND Rain ='1'
                {
                    var rain_value_10 = "";
                    var rain_value_1 = "";
                    var rain_value_3 = "";
                    var rain_value_24 = "";
                    var rain_value_today = "";
                    if (iRain.message.min_10[i].iSUM == -99) {

                        rain_value_10 = "資料中斷";
                    } else {
                        rain_value_10 = iRain.message.min_10[i].iSUM;
                    }


                    rain_top_table += " <tr class=\"tr\"> " + //加入 class = "tr" 是為了移除舊資料換新的資料
                        "<td>" + (top_row + 1) + "</td>" +
                        "<td>" + iRain.message.min_10[i].NAME_C + "</td>" +
                        "<td class=\"right\">" + rain_value_10 + "</td>" +
                        "<td class=\"right\">" + chackVal(formatFloat(iRain.message.hour_1[i].iSUM, 3)) + "</td>" +
                        "<td class=\"right\">" + chackVal(formatFloat(iRain.message.hour_3[i].iSUM, 3)) + "</td>" +
                        "<td class=\"right\">" + chackVal(formatFloat(iRain.message.hour_24[i].iSUM, 3)) + "</td>" +
                        "<td class=\"right\">" + chackVal(formatFloat(iRain.message.today[i].iSUM, 3)) + "</td>";
                    //if (chackVal(iRain.message.min_10[i].iSUM) == "資料中斷") {
                    //    rain_top_table += "<td><img src=\"images/light_gray.png\"/></td>" +
                    //        "<td>" + iRain.message.min_10[i].ORG_NAME + "</td>" +
                    //        "<td>" + TimeIsNull(iRain.message.min_10[i].DATADATETIME) + "</td>" +
                    //        "</tr>";
                    //} else {

                    if (iRain.message.min_10[i].light == "red") {
                        if (weight_rain < 4) {
                            weight_rain = 4;

                            all_light_s = "images/light_red_s.png";
                        }
                    } else if (iRain.message.min_10[i].light == "yellow") {
                        if (weight_rain < 3) {
                            weight_rain = 3;

                            all_light_s = "images/light_yellow_s.png";
                        }
                    }

                    rain_top_table += "<td><img src=\"images/light_" + iRain.message.min_10[i].light + ".png\"/></td>" +
                        "<td>" + iRain.message.min_10[i].ORG_NAME + "</td>" +
                        "<td>" + TimeIsNull(iRain.message.min_10[i].DATADATETIME) + "</td>" +
                        "</tr>";
                    //}


                    //addMarker(iRain.message.min_10[i].TM2_X97, iRain.message.min_10[i].TM2_Y97, RainLights(IsNull(iRain.message.min_10[i].iSUM)));

                    top_row++;
                } else if (!iRain.message.min_10[i].PLAN_IN && iRain.message.min_10[i].Rain)//PLAN_IN ='0' AND Rain ='1'
                {

                    var rain_value_10 = "";
                    if (iRain.message.min_10[i].iSUM == -99) {

                        rain_value_10 = "資料中斷";
                    } else {
                        rain_value_10 = iRain.message.min_10[i].iSUM;
                    }

                    rain_bottom_table += " <tr  class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
                        "<td>" + (bottom_row + 1) + "</td>" +
                        "<td>" + iRain.message.min_10[i].NAME_C + "</td>" +
                        "<td class=\"right\">" + rain_value_10 + "</td>" +
                        "<td class=\"right\">" + chackVal(iRain.message.hour_1[i].iSUM) + "</td>" +
                        "<td class=\"right\">" + chackVal(iRain.message.hour_3[i].iSUM) + "</td>" +
                        "<td class=\"right\">" + chackVal(iRain.message.hour_24[i].iSUM) + "</td>" +
                        "<td class=\"right\">" + chackVal(iRain.message.today[i].iSUM) + "</td>" +
                        "<td><img src=\"images/light_" + iRain.message.min_10[i].light + ".png\"/></td>" +
                        "<td>" + iRain.message.min_10[i].ORG_NAME + "</td>" +
                        "<td>" + TimeIsNull(iRain.message.min_10[i].DATADATETIME) + "</td>" +
                        "</tr>";

                    //addMarker(iRain.message.min_10[i].TM2_X97, iRain.message.min_10[i].TM2_Y97, RainLights(IsNull(iRain.message.min_10[i].iSUM)));

                    bottom_row++;
                }

            }

            $("#RainTopTable").append(rain_top_table);
            $("#RainBottomTable").append(rain_bottom_table);


            var data_start = iRain.message.data_start[0].DataDatetime.split("T")[0];
            var data_end = iRain.message.data_end[0].DataDatetime.split("T")[0];


            setdatepicker_rain(data_start, data_end)

            SetMonitorRain()
            // rain_highchart()
        } else {
            setdatepicker_rain('', '')
            alert(iRain.message);
        }

    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
}