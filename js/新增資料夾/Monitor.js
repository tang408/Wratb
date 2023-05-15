

$(document).ready(function () {



    //SetRainTable();//預設
    //NCDR_CAP();//預設
    $("#li2_1").on("click", function () {
        if (iTag != 1) {

            $("#item-1").show();
            IsInitMap = false;//重設燈號
            //clear_iframe();//移除iframe map
            $("#div_rain").html('<iframe src="PureMap.aspx" style="width:100%;height:390px; box-sizing:content-box;"></iframe>');
            $(".tr").remove();//移除舊的資料
            iTag = 1;
            SetRainTable();
            //NCDR_CAP();//NCDR
        }


    });

    $("#li2_2").on("click", function () {
        if (iTag != 2) {

            $("#item-2").show();
            IsInitMap = false;//重設燈號
            //clear_iframe();//移除iframe map
            $("#div_water").html('<iframe src="PureMap.aspx" style="width:100%;height:390px; box-sizing:content-box;"></iframe>');
            $(".tr").remove();//移除舊的資料
            iTag = 2;
            SetWaterTable();
        }
    });

    $("#li2_3").on("click", function () {
        if (iTag != 3) {

            $("#item-3").show();
            IsInitMap = false;//重設燈號
            //clear_iframe();//移除iframe map
            $("#div_move").html('<iframe src="PureMap.aspx" style="width:100%;height:390px; box-sizing:content-box;"></iframe>');
            $(".tr").remove();//移除舊的資料
            iTag = 3;


            SetMonitorMove();
        }
    });

    $("#li2_4").on("click", function () {
        if (iTag != 4) {

            $("#item-4").show();
            IsInitMap = false;//重設燈號
            //clear_iframe();//移除iframe map
            $("#div_turb").html('<iframe src="PureMap.aspx" style="width:100%;height:390px; box-sizing:content-box;"></iframe>');
            $(".tr").remove();//移除舊的資料
            iTag = 4;
            SetTurbTable();
        }

    });

    $("#li2_5").on("click", function () {
        if (iTag != 5) {

            $("#item-5").show();
            IsInitMap = false;//重設燈號
            //clear_iframe();//移除iframe map
            $("#div_cam").html('<iframe src="PureMap.aspx" style="width:100%;height:390px; box-sizing:content-box;"></iframe>');
            $(".tr").remove();//移除舊的資料
            iTag = 5;
            SetCamTable();
        }

    });



    //當 傾斜觀測 月份被選取時
    $("#ddl_year_month1").change(function () {

        var ym1 = $("#ddl_year_month1").val();
        var ym2 = $("#ddl_year_month2").val();
        if (parseInt(ym1) > parseInt(ym2)) {
            $("#ddl_year_month1").val(ym2);
            alert("起始月份不可以大於結束月份，請重新選擇！");
        }

    });

    //當 傾斜觀測 月份被選取時
    $("#ddl_year_month2").change(function () {
        var ym1 = $("#ddl_year_month1").val();
        var ym2 = $("#ddl_year_month2").val();

        if (parseInt(ym1) > parseInt(ym2)) {
            $("#ddl_year_month2").val(ym1);
            alert("結束月份不可以大於起始月份，請重新選擇！");
        }

    });

    $("#btnQuery").on("click", function () {
        var ym1 = $("#ddl_year_month1").val();
        var ym2 = $("#ddl_year_month2").val();
        var station = $("#dll_station").val();
        // alert("year_month1" + ym1 + ",year_month2" + ym2 + "station" + station);
        let iMove = JSON.parse(move_json);
        _highcharts(ym1, ym2, station, iMove);


    });

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

    $("#btnWaterQuery").on("click", function () {


        var type = $('input[name*=water_options]:checked').val()
        var ST_No = $("#water_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = $("#water_date_start").val();
        var date_end = $("#water_date_end").val();

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
            WaterHighChartData(ST_No, type, date_start, date_end, true);
        }


    });



    //24小時
    $("#rain_option1").on("change", function () {
        $("#rain_time_str").hide()
        $("#rain_date_start").hide()
        $("#rain_tilde").hide()
        $("#rain_date_end").hide()
        $("#btnRainQuery").hide()
        var type = $('input[name*=rain_options]:checked').val()
        var ST_No = $("#rain_station").val();
        // alert("RainQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        RainHighChartData(ST_No, type, date_start, date_end, true);

    });

    //72小時
    $("#rain_option2").on("change", function () {
        $("#rain_time_str").hide()
        $("#rain_date_start").hide()
        $("#rain_tilde").hide()
        $("#rain_date_end").hide()
        $("#btnRainQuery").hide()
        var type = $('input[name*=rain_options]:checked').val()
        var ST_No = $("#rain_station").val();
        // alert("RainQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        RainHighChartData(ST_No, type, date_start, date_end, true);
    });

    //一週
    $("#rain_option3").on("change", function () {
        $("#rain_time_str").hide()
        $("#rain_date_start").hide()
        $("#rain_tilde").hide()
        $("#rain_date_end").hide()
        $("#btnRainQuery").hide()
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
        $("#rain_time_str").show()
        $("#rain_date_start").show()
        $("#rain_tilde").show()
        $("#rain_date_end").show()
        $("#btnRainQuery").show()

    });

    $("#rain_station").on("change", function () {
        var ST_No = $("#rain_station").val();
        var date_start = '';
        var date_end = '';
        var type = $('input[name*=rain_options]:checked').val()
        RainHighChartData(ST_No, type, date_start, date_end, true);

    });

    //24小時
    $("#water_option1").on("change", function () {
        $("#water_time_str").hide()
        $("#water_date_start").hide()
        $("#water_tilde").hide()
        $("#water_date_end").hide()
        $("#btnWaterQuery").hide()

        var type = $('input[name*=water_options]:checked').val()
        var ST_No = $("#water_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        WaterHighChartData(ST_No, type, date_start, date_end, true);

    });

    //72小時
    $("#water_option2").on("change", function () {
        $("#water_time_str").hide()
        $("#water_date_start").hide()
        $("#water_tilde").hide()
        $("#water_date_end").hide()
        $("#btnWaterQuery").hide()

        var type = $('input[name*=water_options]:checked').val()
        var ST_No = $("#water_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        WaterHighChartData(ST_No, type, date_start, date_end, true);


    });

    //一週
    $("#water_option3").on("change", function () {
        $("#water_time_str").hide()
        $("#water_date_start").hide()
        $("#water_tilde").hide()
        $("#water_date_end").hide()
        $("#btnWaterQuery").hide()

        var type = $('input[name*=water_options]:checked').val()
        var ST_No = $("#water_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        WaterHighChartData(ST_No, type, date_start, date_end, true);


    });

    //自訂
    $("#water_option4").on("change", function () {
        $("#water_time_str").show()
        $("#water_date_start").show()
        $("#water_tilde").show()
        $("#water_date_end").show()
        $("#btnWaterQuery").show()

    });

    $("#water_station").on("change", function () {
        var ST_No = $("#water_station").val();
        var date_start = '';
        var date_end = '';
        var type = $('input[name*=water_options]:checked').val()
        WaterHighChartData(ST_No, type, date_start, date_end, true);

    });


    //濁度
    //24小時
    $("#turb_option1").on("change", function () {
        $("#turb_time_str").hide()
        $("#turb_date_start").hide()
        $("#turb_tilde").hide()
        $("#turb_date_end").hide()
        $("#btnTurbQuery").hide()

        var type = $('input[name*=turb_options]:checked').val()
        var ST_No = $("#turb_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        TurbHighChartData(ST_No, type, date_start, date_end, true);

    });

    //72小時
    $("#turb_option2").on("change", function () {
        $("#turb_time_str").hide()
        $("#turb_date_start").hide()
        $("#turb_tilde").hide()
        $("#turb_date_end").hide()
        $("#btnTurbQuery").hide()

        var type = $('input[name*=turb_options]:checked').val()
        var ST_No = $("#turb_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        TurbHighChartData(ST_No, type, date_start, date_end, true);


    });

    //一週
    $("#turb_option3").on("change", function () {
        $("#turb_time_str").hide()
        $("#turb_date_start").hide()
        $("#turb_tilde").hide()
        $("#turb_date_end").hide()
        $("#btnTurbQuery").hide()

        var type = $('input[name*=turb_options]:checked').val()
        var ST_No = $("#turb_station").val();
        // alert("btnWaterQuery : " + type)

        //rain_highchart()
        var date_start = '';
        var date_end = '';

        TurbHighChartData(ST_No, type, date_start, date_end, true);


    });

    //自訂
    $("#turb_option4").on("change", function () {
        $("#turb_time_str").show()
        $("#turb_date_start").show()
        $("#turb_tilde").show()
        $("#turb_date_end").show()
        $("#btnTurbQuery").show()

    });

    $("#turb_station").on("change", function () {
        var ST_No = $("#turb_station").val();
        var date_start = '';
        var date_end = '';
        var type = $('input[name*=turb_options]:checked').val()
        TurbHighChartData(ST_No, type, date_start, date_end, true);

    });



    //當按下監測資訊時，會跳至另一頁
    $("#li2").on("click", function () {

        window.open("MainMap.aspx", "_parent");

    });


    
    $("#single_1").fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: {
            title: {
                type: 'outside'
            }
        }
    });

    $("#single_2").fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: {
            title: {
                type: 'outside'
            }
        }
    });

    $("#single_3").fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: {
            title: {
                type: 'outside'
            }
        }
    });

    $("#single_4").fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: {
            title: {
                type: 'outside'
            }
        }
    });

    road_closed();





    //alert(Parameter);
    //if(queryString!=null)
    // {

    //}
    Timeout();

});



/**
     * 截圖功能
     * targetDom 要克隆的目標dom元素
     * cb 回撥函式
     */
function screenShot(targetDom, cb) {
    var copyDom = targetDom.clone();//克隆dom節點
    copyDom.css('display', 'block');
    $('body').append(copyDom);//把copy的截圖物件追加到body後面
    var width = copyDom.width();//dom寬
    var height = copyDom.height();//dom高
    var scale = 1;//放大倍數
    var canvas = document.createElement('canvas');
    canvas.width = width * scale;//canvas寬度
    canvas.height = height * scale;//canvas高度
    var content = canvas.getContext("2d");
    content.scale(scale, scale);
    var rect = copyDom.get(0).getBoundingClientRect();//獲取元素相對於視察的偏移量
    content.translate(-rect.left, -rect.top);//設定context位置，值為相對於視窗的偏移量負值，讓圖片復位
    html2canvas(copyDom, {
        allowTaint: true,
        tainTest: true,
        scale: scale,
        canvas: canvas,
        width: width,
        heigth: height,
        onrendered: function (canvas) {
            if (cb) {
                copyDom.css('display', 'none');
                cb(canvas.toDataURL("image/png"), width, height);
            }
        }
    });
}


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


function setdatepicker_water(startDate, endDate) {
    if (startDate == "" && endDate == "") {
        $("#water_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            //startDate: "2019-01-01",
            //endDate: "2020-01-01",
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#water_date_end").datepicker({
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
        $("#water_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#water_date_end").datepicker({
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


function setdatepicker_turb(startDate, endDate) {

    if (startDate == "" && endDate == "") {
        $("#turb_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            //startDate: "2019-01-01",
            //endDate: "2020-01-01",
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#turb_date_end").datepicker({
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
        $("#turb_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#turb_date_end").datepicker({
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


//設定Water資料
function SetMonitorWater() {

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
            $("#water_station").html("");//清掉測站的資料
            var ST_NO = "";
            //重新填入測站名稱
            for (var i = 0; i < iMove.message.length; i++) {
                if (iMove.message[i].Water) {
                    if (ST_NO == "") {
                        ST_NO = iMove.message[i].ST_NO;
                    }
                    $("#water_station").append($("<option></option>").attr("value", iMove.message[i].ST_NO).text(iMove.message[i].NAME_C));
                }
            }
            ST_NO = '18-4BW';
            var type = $('input[name*=water_options]:checked').val()
            $("#water_station").val(ST_NO);
            WaterHighChartData(ST_NO, type, '', '')



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


function WaterHighChartData(ST_No, type, date_start, date_end, isQuery) {


    if (isQuery === undefined) {
        isQuery = false;
    }

    // alert(ST_No + "," + type + "," + date_start + "," + date_end);
    var request = $.ajax({
        url: WaterHighChartData_URL,
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

        let iWaterData = JSON.parse(msg);

        if (iWaterData.success) {

            water_highchart(iWaterData.message[0].NAME_C, iWaterData)


        } else {
            if (isQuery) {
                water_highchart(ST_No, iWaterData)
                alert(iWaterData.message);
            }
        }




    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
}



//設定Trub資料
function SetMonitorTurb() {

    //設定 站台 資料
    var request = $.ajax({
        url: STATION_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        // alert(msg);
        let iData = JSON.parse(msg);
        move_json = "";
        if (iData.success) {
            move_json = msg;
            $("#turb_station").html("");//清掉測站的資料
            //重新填入測站名稱
            var ST_NO = "";
            for (var i = 0; i < iData.message.length; i++) {
                if (iData.message[i].Turb) {
                    if (ST_NO == "") {
                        ST_NO = iData.message[i].ST_NO;
                    }
                    $("#turb_station").append($("<option></option>").attr("value", iData.message[i].ST_NO).text(iData.message[i].NAME_C));
                }
            }
            //Rain01

            ST_NO = '1140H095';
            var type = $('input[name*=turb_options]:checked').val()
            $("#turb_station").val(ST_NO);


            TurbHighChartData(ST_NO, type, '', '')



        } else {
            alert(iData.message);
        }

    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
    //設定 站台 資料 尾

}

function TurbHighChartData(ST_No, type, date_start, date_end, isQuery) {

    if (isQuery === undefined) {
        isQuery = false;
    }

    //alert(ST_No + "," + type + "," + date_start + "," + date_end);
    var request = $.ajax({
        url: TurbHighChartData_URL,
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

        let iData = JSON.parse(msg);

        if (iData.success) {

            turb_highchart(iData.message[0].NAME_C, iData)
        } else {
            if (isQuery) {
                turb_highchart(ST_No, iData)
                alert(iData.message);
            }
        }




    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
}


///計時刷新機制
function Timeout() {

    //if (iTag == 1)//雨量
    //{
    //    $(".tr").remove();//移除舊的資料
    //    SetRainTable();
    //    NCDR_CAP();
    //} else if (iTag == 2)//水位
    //{
    //    $(".tr").remove();//移除舊的資料
    //    SetWaterTable();
    //} else if (iTag == 3)//傾斜觀測
    //{
    //    $(".tr").remove();//移除舊的資料

    //} else if (iTag == 4)//濁度
    //{
    //    $(".tr").remove();//移除舊的資料
    //    SetTurbTable();
    //} else if (iTag == 5)//攝影機
    //{
    //    $(".tr").remove();//移除舊的資料

    //}

    $(".tr").remove();//移除舊的資料
    if (iTag == 1) {
        SetRainTable();
    } else if (iTag == 2) {
        SetWaterTable();
    } else if (iTag == 4) {
        SetTurbTable();
    } else if (iTag == 3) {
        SetMonitorMove();
    }
    //NCDR_CAP();
    
    
    

    right_top_light();

    setTimeout(function () { Timeout() }, refresh_time);
}

//清掉所有的 iframe 的內容
function clear_iframe() {
    $("#div_rain").html("");
    $("#div_water").html("");
    $("#div_turb").html("");
    $("#div_cam").html("");
    $("#div_move").html("");
}

//陸上颱風警報期間台灣地區定量降水格點預報
function NCDR_CAP() {

    var request = $.ajax({
        url: NCDR_CAP_PARSE_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {

        $(".tr_ncdr").remove();//因為，颱風回來的資料很久才會抓得到，所以放在這去做移除 tr 的動作

        let iNCDR = JSON.parse(msg);

        var typhoon_table = " <tr class=\"tr_ncdr\"> " + //加入 class = "tr" 是為了移除舊資料換新的資料
            "<td class=\"right\">" + iNCDR.message.future_0_6 + "<br />(更新時間：" + TimeIsNull(iNCDR.message.future_0_6_update) + ")</td>" +
            "<td class=\"right\">" + iNCDR.message.future_6_12 + "<br />(更新時間：" + TimeIsNull(iNCDR.message.future_6_12_update) + ")</td>" +
            "<td class=\"right\">" + iNCDR.message.future_12_18 + "<br />(更新時間：" + TimeIsNull(iNCDR.message.future_12_18_update) + ")</td>" +
            "<td class=\"right\">" + iNCDR.message.future_18_24 + "<br />(更新時間：" + TimeIsNull(iNCDR.message.future_18_24_update) + ")</td>" +
            "</tr>";
        //如果發佈陸上颱風警報時，會出現
        var dtToday = new Date();
        var d = new Date(iNCDR.message.future_0_6_update);
        if (getDate(dtToday) == getDate(d)) {

            $("#Typhoon_div").show();
        }
        //如果發佈陸上颱風警報時，會出現

        $("#TyphoonTable").append(typhoon_table);
    });

    request.fail(function (jqXHR, textStatus) {
        // alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });

}

function getDate(date_data) {
    return date_data.getFullYear() + "-" + (date_data.getMonth() + 1) + "-" + date_data.getDate();
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

/* 
* 獲得時間差,時間格式為 年-月-日 小時:分鐘:秒 或者 年/月/日 小時：分鐘：秒 
* 其中，年月日為全格式，例如 ： 2010-10-12 01:00:00 
* 返回精度為：秒，分，小時，天 
*/
function GetDateDiff(startTime, endTime, diffType) {
    //將xxxx-xx-xx的時間格式，轉換為 xxxx/xx/xx的格式 
    startTime = startTime.replace(/\-/g, "/");
    endTime = endTime.replace(/\-/g, "/");
    //將計算間隔類性字元轉換為小寫 
    diffType = diffType.toLowerCase();
    var sTime = new Date(startTime); //開始時間 
    var eTime = new Date(endTime); //結束時間 
    //作為除數的數字 
    var divNum = 1;
    switch (diffType) {
        case "second":
            divNum = 1000;
            break;
        case "minute":
            divNum = 1000 * 60;
            break;
        case "hour":
            divNum = 1000 * 3600;
            break;
        case "day":
            divNum = 1000 * 3600 * 24;
            break;
        default:
            break;
    }
    return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
}

function chackVal(iSUM) {
    if (iSUM == -99) {

        return "資料中斷";
    } else {
        return iSUM;
    }
}


//設定水位資料
function SetWaterTable() {


    var request = $.ajax({
        url: WATER_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        //alert(msg);
        let iWater = JSON.parse(msg);
        water_json = "";
        if (iWater.success) {
            water_json = msg;
            var water_top_table = "";
            var water_bottom_table = "";

            var top_row = 0;
            var bottom_row = 0;
            for (var i = 0; i < iWater.message.water.length; i++) {
                if (iWater.message.water[i].PLAN_IN && iWater.message.water[i].Water)//PLAN_IN ='1' AND Rain ='1'
                {
                    var water_value = "";
                    if (iWater.message.water[i].iSUM == -99.0) {
                        water_value = "資料中斷";
                    } else {
                        water_value = numFiexed(iWater.message.water[i].iSUM, 3);
                    }
                    water_top_table += " <tr class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
                        "<td>" + (top_row + 1) + "</td>" +
                        "<td>" + iWater.message.water[i].NAME_C + "</td>" +
                        "<td>" + iWater.message.water[i].NormalWater + "</td>" +
                        "<td class=\"right\">" + water_value + "</td>" +
                        "<td><img src=\"images/light_" + iWater.message.water[i].light + ".png\"/></td>" +
                        //"<td><img src=\"" + WaterLights(IsNull(iWater.message.water[i].iSUM), IsNull(iWater.message.water[i].NormalWater)) + "\"/></td>" +
                        "<td>" + iWater.message.water[i].ORG_NAME + "</td>" +
                        "<td>" + TimeIsNull(iWater.message.water[i].DATADATETIME) + "</td>" +
                        "</tr>";
                    top_row++;

                    if (iWater.message.water[i].light == "yellow") {
                        if (weight_water < 3) {
                            weight_water = 3;

                            water_light_s = "images/light_yellow_s.png";
                        }
                    } else if (iWater.message.water[i].light == "blue") {
                        if (weight_water < 2) {
                            weight_water = 2;

                            water_light_s = "images/light_blue_s.png";
                        }
                    }
                }
                //else if (!iWater.message.water[i].PLAN_IN && iWater.message.water[i].Water)//PLAN_IN ='0' AND Rain ='1'
                //{
                //    water_bottom_table += " <tr class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
                //        "<td>" + (bottom_row + 1) + "</td>" +
                //        "<td>" + iWater.message.water[i].NAME_C + "</td>" +
                //        "<td class=\"right\">" + IsNull(iWater.message.water[i].iSUM) + "</td>" +
                //        "<td><img src=\"" + WaterLights(IsNull(iWater.message.water[i].iSUM), IsNull(iWater.message.water[i].NormalWater)) + "\"/></td>" +
                //        "<td>" + iWater.message.water[i].ORG_NAME + "</td>" +
                //        "<td>" + TimeIsNull(iWater.message.water[i].DATADATETIME) + "</td>" +
                //    "</tr>";
                //    bottom_row++;
                //}

            }

            $("#WaterTopTable").append(water_top_table);
            // $("#WaterBottomTable").append(water_bottom_table);
            $("#WaterBottomTable").hide();

            var data_start = iWater.message.data_start[0].DataDatetime.split("T")[0];
            var data_end = iWater.message.data_end[0].DataDatetime.split("T")[0];

            // alert(data_start + "," + data_end)

            setdatepicker_water(data_start, data_end)

            //water_highchart()
            SetMonitorWater();
        } else {
            setdatepicker_water('', '')
            alert(iWater.message);
        }

    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });

}

//設定雨量資料
function SetTurbTable() {

    var request = $.ajax({
        url: TURB_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        //alert(msg);
        let iTurb = JSON.parse(msg);
        turb_json = "";
        if (iTurb.success) {
            turb_json = msg;
            //let iObj = JSON.parse(iRain.message);
            //let iObj = JSON.parse(JSON.stringify(iRain.message));
            // alert(iRain.message.min_10.length);
            var turb_top_table = "";

            var top_row = 0;
            var bottom_row = 0;
            for (var i = 0; i < iTurb.message.turb.length; i++) {
                if (!iTurb.message.turb[i].PLAN_IN && iTurb.message.turb[i].Turb)//PLAN_IN ='1' AND Rain ='1'
                {
                    var trub_value = "";
                    if (iTurb.message.turb[i].iSUM == -99) {
                        trub_value = "資料中斷";
                    } else {
                        trub_value = "" + iTurb.message.turb[i].iSUM;
                    }
                    turb_top_table += " <tr class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
                        "<td>" + (top_row + 1) + "</td>" +
                        "<td>" + iTurb.message.turb[i].NAME_C + "</td>" +
                        "<td class=\"right\">" + trub_value + "</td>" +
                        "<td><img src=\"images/light_" + iTurb.message.turb[i].light + ".png\"/></td>" +
                        "<td>" + iTurb.message.turb[i].ORG_NAME + "</td>" +
                        "<td>" + TimeIsNull(iTurb.message.turb[i].DATADATETIME) + "</td>" +
                        "</tr>";
                    top_row++;
                }

            }

            $("#TurbTopTable").append(turb_top_table);

            var data_start = iTurb.message.data_start[0].DataDatetime.split("T")[0];
            var data_end = iTurb.message.data_end[0].DataDatetime.split("T")[0];


            setdatepicker_turb(data_start, data_end);

            SetMonitorTurb();

        } else {
            alert(iTurb.message);
        }

    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
}

//設定攝影機資料
function SetCamTable() {

    if (iTag == 5) {
        //$('#camera01').attr('src', domain + '/WebService/AXIS_Camera.ashx?CameraID=CCTV01&now=' + new Date());
        //$('#camera02').attr('src', domain + '/WebService/AXIS_Camera.ashx?CameraID=CCTV02&now=' + new Date());
        //$('#camera03').attr('src', domain + '/WebService/AXIS_Camera.ashx?CameraID=CCD1&now=' + new Date());
        $('#camera04').attr('src', domain + '/WebService/AXIS_Camera.ashx?CameraID=CCD3&now=' + new Date());
        $('#camera05').attr('src', domain + '/WebService/AXIS_Camera.ashx?CameraID=CCD1&now=' + new Date());

        //setTimeout(function () {
        //    $("#single_1").attr("href", domain + '/WebService/AXIS_Camera.ashx?CameraID=CCTV01&now=' + new Date());
        //}, 1000);
        //setTimeout(function () {
        //    $("#single_2").attr("href", domain + '/WebService/AXIS_Camera.ashx?CameraID=CCTV03&now=' + new Date());
        //}, 1500);
        //setTimeout(function () {
        //    $("#single_3").attr("href", domain + '/WebService/AXIS_Camera.ashx?CameraID=CCD1&now=' + new Date());
        //}, 2000);
        //setTimeout(function () {
        //    $("#single_4").attr("href", domain + '/WebService/AXIS_Camera.ashx?CameraID=CCD3&now=' + new Date());
        //}, 2500);





        setTimeout(function () { SetCamTable() }, 30000);
    }

    //alert(new Date());
}



//設定傾斜觀測資料
function SetMonitorMove() {

    //設定 站台 資料
    var request = $.ajax({
        url: MONITOR_MOVE_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        // alert(msg);
        let iMove = JSON.parse(msg);
        move_json = "";
        if (iMove.success) {
            move_json = msg;
            $("#dll_station").html("");//清掉測站的資料
            $("#ddl_year_month1").html("");//清掉年的資料
            $("#ddl_year_month2").html("");//清掉月的資料
            //重新填入測站名稱
            for (var i = 0; i < iMove.message.station.length; i++) {
                $("#dll_station").append($("<option></option>").attr("value", iMove.message.station[i].ST_NO).text(iMove.message.station[i].NAME_C));
            }

            var LastYear = "";
            var LastMonth = "";
            var LastDay = "";

            var span_between_last = "";
            var span_between_this = "";
            //重新填入年月的資料
            for (var i = 0; i < iMove.message.year_month.length; i++) {
                if (iMove.message.year_month[i].iYear != null) {
                    if (LastYear != iMove.message.year_month[i].iYear ||
                        LastMonth != iMove.message.year_month[i].iMonth) {
                        LastYear = iMove.message.year_month[i].iYear;
                        LastMonth = iMove.message.year_month[i].iMonth;
                        $("#ddl_year_month1").append($("<option></option>").attr("value", iMove.message.year_month[i].iYear + "" + iMove.message.year_month[i].iMonth).text(iMove.message.year_month[i].iYear + "年" + iMove.message.year_month[i].iMonth + "月"));
                        $("#ddl_year_month2").append($("<option></option>").attr("value", iMove.message.year_month[i].iYear + "" + iMove.message.year_month[i].iMonth).text(iMove.message.year_month[i].iYear + "年" + iMove.message.year_month[i].iMonth + "月"));

                    }
                    //if (i == 0) {
                    //    $("#span_this").html("本期：" + iMove.message.year_month[i].iYear + "年" + iMove.message.year_month[i].iMonth + "月" + iMove.message.year_month[i].iDay + "日");//本期年月
                    //    span_between_this += iMove.message.year_month[i].iYear + "年" + iMove.message.year_month[i].iMonth + "月";
                    //} else if (i == 1) {
                    //    $("#span_last").html("上期：" + iMove.message.year_month[i].iYear + "年" + iMove.message.year_month[i].iMonth + "月" + iMove.message.year_month[i].iDay + "日");//上期年月
                    //    span_between_last += iMove.message.year_month[i].iYear + "年" + iMove.message.year_month[i].iMonth + "月";

                    //}

                    $("#span_between").html("總累積位移計算區間：" + "2018年5月" + "~" + span_between_this);//上期年月
                }
            }

            //判斷現在是那一期



            //  alert($("#dll_station").val());

            $("#dll_station").val("SB-4");
            $("#ddl_year_month1").val(iMove.message.year_month[iMove.message.year_month.length - 1].iYear + "" + iMove.message.year_month[iMove.message.year_month.length - 1].iMonth);
            var ym1 = $("#ddl_year_month1").val();
            var ym2 = $("#ddl_year_month2").val();
            var station = $("#dll_station").val();
            // alert("year_month1" + ym1 + ",year_month2" + ym2 + "station" + station);
            //

            _highcharts(ym1, ym2, station, iMove);

            // $('.tr').remove();
            var move_table = "";
            for (var i = 0; i < iMove.message.station.length; i++) {

                var td = "";
                if (iMove.message.station[i].ST_NO == "18-1BW" || iMove.message.station[i].ST_NO == "SB-3" || iMove.message.station[i].ST_NO == "18-2BW*") {
                    td = "<td>---</td>" +
                        "<td>---</td>" +
                        "<td>---</td>";
                } else {
                    td = "<td>" + MoveValue(iMove.message.station[i].ST_NO, iMove, 0, 0) + "</td>" +
                        //"<td>" + MoveValue(iMove.message.station[i].NAME_C, iMove, 0, 1) + "</td>" +
                        "<td>" + MoveValue(iMove.message.station[i].ST_NO, iMove, 1, 0) + "</td>" +
                        //"<td>" + MoveValue(iMove.message.station[i].NAME_C, iMove, 1, 1) + "</td>" +
                        "<td>" + MoveValue(iMove.message.station[i].ST_NO, iMove, 2, 0) + "</td>";
                }

                move_table += " <tr class=\"tr\"> " + //加入 class = "tr" 是為了移除舊資料換新的資料
                    "<td>" + (i + 1) + "</td>" +
                    "<td>" + iMove.message.station[i].NAME_C + "</td>" +
                    "<td>" + iMove.message.station[i].DEPTH + "</td>" +

                    td +

                    "<td><img src=\"images/light_" + iMove.message.station[i].light + ".png\"/></td>" +
                    "<td>" + iMove.message.station[i].ORG_NAME + "</td>" +
                    "<td>" + MoveYearMonth(iMove.message.station[i].ST_NO, iMove, 1) + "</td>" +
                    "<td>" + MoveYearMonth(iMove.message.station[i].ST_NO, iMove, 5) + "</td>" +
                    "</tr>";

                if (iMove.message.station[i].light == "blue") {
                    if (weight_tile == 2) {
                        weight_tile = 2;
                        tile_light_s = "images/light_blue_s.png";
                    }

                } else if (iMove.message.station[i].light == "yellow") {
                    if (weight_tile == 3) {
                        weight_tile = 3;
                        tile_light_s = "images/light_yellow_s.png";
                    }

                } else if (iMove.message.station[i].light == "red") {
                    if (weight_tile == 4) {
                        weight_tile = 4;
                        tile_light_s = "images/light_red_s.png";
                    }
                }
            }
            $("#MoveTable").append(move_table);

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

var all_light_s = "images/light_green_s.png"
var water_light_s = "images/light_green_s.png"
var rain_light_s = "images/light_green_s.png"
var tile_light_s = "images/light_green_s.png"

var weight_water = 1;//水位權重
var weight_rain = 1;//雨量權重
var weight_tile = 1;//傾斜觀測權重

//設定右上角的燈號
function right_top_light() {

    //紅色>黃色>藍色>綠色
    //如果 是 4 就代表是 紅燈 、3 是黃燈 、2 是藍燈
    //修改成，只要雨量什麼燈，綜合就變成什麼燈
    //if (weight_water == 4 || weight_rain == 4 || weight_tile == 4) {
    //    all_light_s = "images/light_red_s.png";
    //} else if (weight_water == 3 || weight_rain == 3 || weight_tile == 3) {
    //    all_light_s = "images/light_yellow_s.png";
    //} else if (weight_water == 2 || weight_rain == 2 || weight_tile == 2) {
    //    all_light_s = "images/light_blue_s.png";
    //}

    //if (weight_rain == 4) {
    //    all_light_s = "images/light_red_s.png";
    //} else if (weight_rain == 3) {
    //    all_light_s = "images/light_yellow_s.png";
    //} else if (weight_rain == 2) {
    //    all_light_s = "images/light_blue_s.png";
    //}


    //if (weight_water == 3) {
    //    water_light_s = "images/light_yellow_s.png";
    //} else if (weight_water == 2) {
    //    water_light_s = "images/light_blue_s.png";
    //}

    //if (weight_rain == 4) {
    //    rain_light_s = "images/light_red_s.png";
    //}
    //else if (weight_rain == 3) {
    //    rain_light_s = "images/light_yellow_s.png";
    //} else if (weight_rain == 2) {
    //    rain_light_s = "images/light_blue_s.png";
    //}

    //if (weight_tile == 2) {
    //    tile_light_s = "images/light_blue_s.png";
    //} else if (weight_tile == 3) {
    //    tile_light_s = "images/light_yellow_s.png";
    //} else if (weight_tile == 4) {
    //    tile_light_s = "images/light_red_s.png";
    //}

    //傾斜觀測 還沒資料

    $("#img_all").attr("src", all_light_s);
    $("#img_water").attr("src", water_light_s);
    $("#img_rain").attr("src", rain_light_s);
    $("#img_tile").attr("src", tile_light_s);

    /*
    //設定 站台 資料
    var request = $.ajax({
        url: LIGHT_URL,
        method: "POST", //請求方式，POST/GET。(預設為GET)
        dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
    });

    request.done(function (msg) {
        // alert(msg);
        let iLight = JSON.parse(msg);
       
        if (iLight.success) {
          
            rain_light = iLight.message.rain_light
            water_light = iLight.message.water_light
            moniter_move_light = iLight.message.moniter_move_light
            sumation_light = iLight.message.sumation_light
            if(rain_light == "green")
            {
                rain_light_s = "images/light_green_s.png"
            } else if (rain_light == "blue") {
                rain_light_s = "images/light_blue_s.png"
            } else if (rain_light == "yellow") {
                rain_light_s = "images/light_yellow_s.png"
            } else if (rain_light == "red") {
                rain_light_s = "images/light_red_s.png"
            }

            if (water_light == "green") {
                water_light_s = "images/light_green_s.png"
            } else if (water_light == "blue") {
                water_light_s = "images/light_blue_s.png"
            } else if (water_light == "yellow") {
                water_light_s = "images/light_yellow_s.png"
            } else if (water_light == "red") {
                water_light_s = "images/light_red_s.png"
            }

            if (moniter_move_light == "green") {
                tile_light_s = "images/light_green_s.png"
            } else if (moniter_move_light == "blue") {
                tile_light_s = "images/light_blue_s.png"
            } else if (moniter_move_light == "yellow") {
                tile_light_s = "images/light_yellow_s.png"
            } else if (moniter_move_light == "red") {
                tile_light_s = "images/light_red_s.png"
            }

            if (sumation_light == "green") {
                all_light_s = "images/light_green_s.png"
            } else if (sumation_light == "blue") {
                all_light_s = "images/light_blue_s.png"
            } else if (sumation_light == "yellow") {
                all_light_s = "images/light_yellow_s.png"
            } else if (sumation_light == "red") {
                all_light_s = "images/light_red_s.png"
            }

            $("#img_all").attr("src", all_light_s);
            $("#img_water").attr("src", water_light_s);
            $("#img_rain").attr("src", rain_light_s);
            $("#img_tile").attr("src", tile_light_s);


        } else {
            alert(iLight.message);
        }

    });

    request.fail(function (jqXHR, textStatus) {
        //alert("Request failed: " + textStatus);
    });

    request.always(function () {


    });
    */
}

function WLights(lights) {
    return "images/light_" + lights + ".png";
}

//水位燈號判斷
function WaterLights(iSUM, X) {
    //alert("iSUM:" + iSUM + ",X:" + X);
    var light = "images/light_green.png";
    if (iSUM == -99) {
        light = "images/light_gray.png";
        return light;
    }
    if (iSUM < (X + 5)) {


        light = "images/light_green.png";

    }

    if (iSUM >= (X + 5)) {


        if (weight_water < 2) {
            weight_water = 2;
        }
        light = "images/light_blue.png";

    }

    if (iSUM >= (X + 10)) {

        if (weight_water < 3) {
            weight_water = 3;
        }

        light = "images/light_yellow.png";

    }

    right_top_light()

    return light;
}

//雨量燈號判斷
function RainLights(d0, d1, d2, d3, d4, d5, d6, d7) {
    var light = "images/light_gray.png";
    var R = 0;
    R = (Math.pow(0.7, 0) * d0) +
        (Math.pow(0.7, 1) * d1) +
        (Math.pow(0.7, 2) * d2) +
        (Math.pow(0.7, 3) * d3) +
        (Math.pow(0.7, 4) * d4) +
        (Math.pow(0.7, 5) * d5) +
        (Math.pow(0.7, 6) * d6) +
        (Math.pow(0.7, 7) * d7);

    if (R < (400 * 0.7)) {

        light = "images/light_green.png";
    }

    if (R >= (400 * 0.7)) {
        if (weight_rain < 3) {
            weight_rain = 3;
        }

        light = "images/light_yellow.png";
    }

    if (R > (400)) {
        if (weight_rain < 4) {
            weight_rain = 4;
        }
        light = "images/light_red.png";
    }

    right_top_light()

    return light;
}

//濁度燈號判斷
function TurbLights(iSUM) {
    var light = "images/light_green.png";
    if (iSUM == -99) {
        light = "images/light_gray.png";
        return light;
    }
    var X = 10;
    if (iSUM < 1000) {
        light = "images/light_green.png";
    }

    if (iSUM > 1000) {
        light = "images/light_yellow.png";
    }

    if (iSUM > 3000) {
        light = "images/light_orange.png";
    }

    if (iSUM > 6000) {
        light = "images/light_red.png";
    }
    return light;
}

//位移燈號判斷
function MoveLights(Station, iMove) {

    var light = "images/light_green.png";
    if (Station == "18-2BW*" || Station == "SB-3" || Station == "18-1BW") {
        light = "images/light_gray.png";
        return light;
    }


    var i = iMove.message.move_data.length;
    for (var i = 0; i < iMove.message.move_data.length - 4; i++) {
        //［本期位移量(最新日期的A_This)/ (最新日期-倒數第二新日期)天數］
        if (Station == iMove.message.move_data[i].Ca_ID && iMove.message.move_data[i].Type == "A_This") {
            var A_this = Math.abs(iMove.message.move_data[i]._0);
            var dt1 = new Date(iMove.message.move_data[i].DataTime);
            var dt2 = new Date(iMove.message.move_data[(i + 4)].DataTime);
            var days = Math.abs((dt2 - dt1) / (1000 * 60 * 60 * 24));
            console.log("dt1:" + iMove.message.move_data[i].DataTime + "," + iMove.message.move_data[i].Ca_ID);
            //console.log("dt2:" + dt1);
            //console.log("dt2 - dt1:" + ath.abs((dt2 - dt1)));
            //console.log("days:" + days);
            // console.log("天數:" + Math.abs((dt2 - dt1) / (1000 * 60 * 60 * 24)) + "," + A_this + "," + iMove.message.move_data[i].Ca_ID);
            console.log("A_this / days:" + (A_this / days) + "," + iMove.message.move_data[i].Ca_ID);
            if ((A_this / days) <= (0.5 / 30.0)) {

                light = "images/light_green.png";
                if (weight_tile == 1) {
                    weight_tile = 1;
                }
            }

            if ((A_this / days) > (0.5 / 30.0) && (A_this / days) <= (0.8 / 30.0)) {

                light = "images/light_blue.png";
                if (weight_tile < 2) {
                    weight_tile = 2;
                }
            }

            if ((A_this / days) > (0.8 / 30.0) && (A_this / days) <= (2.0 / 30.0)) {

                light = "images/light_yellow.png";
                if (weight_tile < 3) {
                    weight_tile = 3;
                }
            }

            if ((A_this / days) > (2.0 / 30.0)) {

                light = "images/light_red.png";
                if (weight_tile < 4) {
                    weight_tile = 4;
                }
            }

            break;
        }
    }


    right_top_light()

    return light;
}

//0,0 本期 的 A This，0,1 本期 的 B This
//1,0 第二大 的 A This，1,1 第二大 的 B This
//0,0 本期 的 A All，0,1 本期 的 B All
function MoveValue(Station, iMove, index, type) {
    var value = 0;

    for (var i = 0; i < iMove.message.move_data.length; i++) {
        //因為，從資料庫來的資料會從 最近的排到之前的，所以，只要抓得到第一筆之後，就可以往後推4筆，做顯示。
        if (Station == iMove.message.move_data[i].Ca_ID) {
            //取得第一筆之後，跳離回圈
            try {
                if (index == 0 && type == 0 && iMove.message.move_data[i].Type == "A_This") {
                    value = iMove.message.move_data[i]._0;
                    break;
                } else if (index == 0 && type == 1 && iMove.message.move_data[i].Type == "B_This") {
                    value = iMove.message.move_data[i]._0;
                    break;
                } else if (index == 1 && type == 0 && iMove.message.move_data[i + 4].Type == "A_This") {
                    value = iMove.message.move_data[i + 4]._0;//直接抓第4個資料
                    break;
                } else if (index == 1 && type == 1 && iMove.message.move_data[i + 4].Type == "B_This") {
                    value = iMove.message.move_data[i + 4]._0;//直接抓第4個資料
                    break;
                } else if (index == 2 && type == 0 && iMove.message.move_data[i].Type == "A_All") {
                    value = iMove.message.move_data[i]._0;
                    break;
                } else if (index == 2 && type == 1 && iMove.message.move_data[i].Type == "B_All") {
                    value = iMove.message.move_data[i]._0;
                    break;
                }
            } catch (error) {
                console.log("No magazines have been favorited.");
            }
        }
    }

    return parseFloat(value).toFixed(3);

}



function MoveYearMonth(Station, iMove, index) {
    var month = "-";
    var read = 0;
    for (var i = 0; i < iMove.message.move_data.length; i++) {
        if (Station == iMove.message.move_data[i].Ca_ID) {
            // return "" + iMove.message.move_data[i].iYear + "-" + iMove.message.move_data[i].iMonth;
            read++;
            if (index == read) {
                var d = new Date(iMove.message.move_data[i].DataTime);
                var iyear = d.getFullYear();
                var imonth = d.getMonth() + 1;
                var iday = d.getDate();

                month = iyear + "-" + imonth + "-" + iday;
                break;
            }

        }
    }

    return month;
}


