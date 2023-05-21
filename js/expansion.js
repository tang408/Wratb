$(document).ready(function () {
    // $("#li2_6").on("click", function () {
    //     if (iTag != 6) {

    //         $("#item-6").show();
    //         IsInitMap = false;//重設燈號
    //         //clear_iframe();//移除iframe map
    //         $("#div_BhExten").html('<iframe src="PureMap.aspx" style="width:100%;height:390px; box-sizing:content-box;"></iframe>');
    //         $(".tr").remove();//移除舊的資料
    //         iTag = 6;
    //         //SetCamTable();
    //         SetBhExtenTable();
    //     }

    // });

    // //7天
    // $("#BhExten_option1").on("change", function () {
    //     $("#BhExten_group").hide();
    // });

    // //14天
    // $("#BhExten_option2").on("change", function () {
    //     $("#BhExten_group").hide();
    // });

    // //30天
    // $("#BhExten_option3").on("change", function () {
    //     $("#BhExten_group").hide();
    // });

    // //自訂
    // $("#BhExten_option4").on("change", function () {
    //     $("#BhExten_group").show();
    // });

    // $("#BhExten_station").on("change", function () {
    //     var ST_No = $("#BhExten_station").val();
    //     var date_start = '';
    //     var date_end = '';
    //     var type = $('input[name*=BhExten_options]:checked').val()
    //     BhExtenHighChartData(ST_No, type, date_start, date_end, true);

    // });

    // $("#btnBhExtenQuery").on("click", function () {

    //     var type = $('input[name*=BhExten_options]:checked').val()
    //     var ST_No = $("#BhExten_station").val();
    //     // alert("RainQuery : " + type)

    //     //rain_highchart()
    //     var date_start = $("#BhExten_date_start").val();
    //     var date_end = $("#BhExten_date_end").val();


    //     if ($("#BhExten_date_start").val() == "" || date_end == "") {
    //         if (date_start == "") {
    //             alert("請輸入起迄時間");
    //         }

    //         if (date_end == "") {
    //             alert("請輸入結束時間");
    //         }
    //     } else {
    //         if (GetDateDiff(date_start, date_end, "day") > 180) {
    //             alert("自訂時間查詢範圍最多為180天，請重新查詢！");
    //             return;
    //         }
    //         BhExtenHighChartData(ST_No, type, date_start, date_end, true);
    //     }


    // });

});

/* 
* 獲得時間差,時間格式為 年-月-日 小時:分鐘:秒 或者 年/月/日 小時：分鐘：秒 
* 其中，年月日為全格式，例如 ： 2010-10-12 01:00:00 
* 返回精度為：秒，分，小時，天 
*/
// function GetDateDiff(startTime, endTime, diffType) {
//     //將xxxx-xx-xx的時間格式，轉換為 xxxx/xx/xx的格式 
//     startTime = startTime.replace(/\-/g, "/");
//     endTime = endTime.replace(/\-/g, "/");
//     //將計算間隔類性字元轉換為小寫 
//     diffType = diffType.toLowerCase();
//     var sTime = new Date(startTime); //開始時間 
//     var eTime = new Date(endTime); //結束時間 
//     //作為除數的數字 
//     var divNum = 1;
//     switch (diffType) {
//         case "second":
//             divNum = 1000;
//             break;
//         case "minute":
//             divNum = 1000 * 60;
//             break;
//         case "hour":
//             divNum = 1000 * 3600;
//             break;
//         case "day":
//             divNum = 1000 * 3600 * 24;
//             break;
//         default:
//             break;
//     }
//     return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(divNum));
// }

// function BhExtenHighChartData(ST_No, type, date_start, date_end, isQuery) {

//     if (isQuery === undefined) {
//         isQuery = false;
//     }

//     //alert(ST_No + "," + type + "," + date_start + "," + date_end);
//     var request = $.ajax({
//         url: BhExtenHighChartData_URL,
//         data: {
//             ST_No: encodeURI(ST_No),
//             type: encodeURI(type),
//             date_start: encodeURI(date_start),
//             date_end: encodeURI(date_end)
//         },
//         method: "POST", //請求方式，POST/GET。(預設為GET)
//         dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
//     });

//     request.done(function (msg) {

//         let iData = JSON.parse(msg);

//         if (iData.success) {
//             // alert(msg);
//             BhExten_highchart(iData.message[0].NAME_C + "@" + iData.message[0].Meter, iData)
//         } else {
//             if (isQuery) {
//                 BhExten_highchart(ST_No, iData)
//                 alert(iData.message);
//             }
//         }




//     });

//     request.fail(function (jqXHR, textStatus) {
//         //alert("Request failed: " + textStatus);
//     });

//     request.always(function () {


//     });
// }

function setdatepicker_BhExten(startDate, endDate) {

    if (startDate == "" && endDate == "") {
        $("#BhExten_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            //startDate: "2019-01-01",
            //endDate: "2020-01-01",
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#BhExten_date_end").datepicker({
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
        $("#BhExten_date_start").datepicker({
            format: "yyyy-mm-dd",
            autoclose: true,
            startDate: startDate,
            endDate: endDate,
            clearBtn: true,
            calendarWeeks: false,
            todayHighlight: true,
            language: 'zh-TW'
        });
        $("#BhExten_date_end").datepicker({
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


// //設定孔內伸縮資料
// function SetBhExtenTable() {

//     var request = $.ajax({
//         url: BhExten_URL,
//         method: "POST", //請求方式，POST/GET。(預設為GET)
//         dataType: "text" //預期Server傳回的資料類型，如果沒指定，jQuery會根據HTTP MIME Type自動選擇以responseXML或responseText傳入你的success callback。
//     });

//     request.done(function (msg) {
//         let iData = JSON.parse(msg);
//         //turb_json = "";
//         if (iData.success) {
//             //turb_json = msg;
//             var iData_top_table = "";

//             var top_row = 0;
//             var bottom_row = 0;
//             for (var i = 0; i < iData.message.BhExten.length; i++) {
//                 if (iData.message.BhExten[i].PLAN_IN && iData.message.BhExten[i].BhExten)//PLAN_IN ='1' AND BhExten ='1'
//                 {
//                     var iData_value = "";

//                     iData_top_table += " <tr class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
//                         "<td>" + (top_row + 1) + "</td>";

//                     if (iData.message.BhExten[i].ST_NO == "ZZ-19C02" || iData.message.BhExten[i].ST_NO == "18-6E") {
//                         iData_top_table += "<td>" + iData.message.BhExten[i].NAME_C + "@20" + "</td>";
//                     } else {
//                         iData_top_table += "<td>" + iData.message.BhExten[i].NAME_C + "</td>";
//                     }

//                     iData_top_table += "<td class=\"right\">" + toDecimal(iData.message.BhExten[i].Meter20) + "</td>" +
//                         "<td><img src=\"images/light_" + iData.message.BhExten[i].light20 + ".png\"/></td>" +
//                         "<td>" + iData.message.BhExten[i].ORG_NAME + "</td>" +
//                         "<td>" + iData.message.BhExten[i].Datetime20 + "</td>" +
//                         "</tr>";
//                     top_row++;

//                     if (iData.message.BhExten[i].ST_NO == "ZZ-19C02" || iData.message.BhExten[i].ST_NO == "18-6E") {
//                         if (iData.message.BhExten[i].ST_NO == "ZZ-19C02") {
//                             iData_top_table += " <tr class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
//                                 "<td>" + (top_row + 1) + "</td>" +
//                                 "<td>" + iData.message.BhExten[i].NAME_C + "@37" + "</td>" +
//                                 "<td class=\"right\">" + toDecimal(iData.message.BhExten[i].Meter45) + "</td>" +
//                                 "<td><img src=\"images/light_" + iData.message.BhExten[i].light45 + ".png\"/></td>" +
//                                 "<td>" + iData.message.BhExten[i].ORG_NAME + "</td>" +
//                                 "<td>" + iData.message.BhExten[i].Datetime45 + "</td>" +
//                                 "</tr>";
//                         } else {
//                             iData_top_table += " <tr class=\"tr\"> " +//加入 class = "tr" 是為了移除舊資料換新的資料
//                                 "<td>" + (top_row + 1) + "</td>" +
//                                 "<td>" + iData.message.BhExten[i].NAME_C + "@45" + "</td>" +
//                                 "<td class=\"right\">" + toDecimal(iData.message.BhExten[i].Meter45) + "</td>" +
//                                 "<td><img src=\"images/light_" + iData.message.BhExten[i].light45 + ".png\"/></td>" +
//                                 "<td>" + iData.message.BhExten[i].ORG_NAME + "</td>" +
//                                 "<td>" + iData.message.BhExten[i].Datetime45 + "</td>" +
//                                 "</tr>";
//                         }

//                         top_row++;
//                         $("#BhExten_station").append($("<option></option>").attr("value", iData.message.BhExten[i].ST_NO + "@20").text(iData.message.BhExten[i].NAME_C + "@20"));
//                         if (iData.message.BhExten[i].ST_NO == "ZZ-19C02") {
//                             $("#BhExten_station").append($("<option></option>").attr("value", iData.message.BhExten[i].ST_NO + "@37").text(iData.message.BhExten[i].NAME_C + "@37"));
//                         } else {
//                             $("#BhExten_station").append($("<option></option>").attr("value", iData.message.BhExten[i].ST_NO + "@45").text(iData.message.BhExten[i].NAME_C + "@45"));
//                         }
//                     } else {
//                         $("#BhExten_station").append($("<option></option>").attr("value", iData.message.BhExten[i].ST_NO).text(iData.message.BhExten[i].NAME_C));
//                     }


//                 }

//             }

//             $("#BhExtenTopTable").append(iData_top_table);

//             var ST_No = $("#BhExten_station").val();
//             // alert("RainQuery : " + type)

//             //rain_highchart()
//             var date_start = '';
//             var date_end = '';


//             setdatepicker_BhExten(date_start, date_end);
//             BhExtenHighChartData(ST_No, 7, date_start, date_end);
//         } else {
//             alert(iData.message);
//         }

//     });

//     request.fail(function (jqXHR, textStatus) {
//         //alert("Request failed: " + textStatus);
//     });

//     request.always(function () {


//     });
// }


// function BhExten_highchart(NAME_C, iData) {
//     //加分鐘
//     var add_minutes = function (dt, minutes) {

//         return new Date(dt.getTime() + minutes * 60000);
//     }

//     var categories = [];
//     var data = [];
//     var this_date;
//     var next_date;

//     var content = [['時間', '伸縮量(毫米)']];
//     var filename = "孔內伸縮";
//     if (iData.success) {
//         for (var i = 0; i < iData.message.length; i++) {
//             var ddt;
//             var i_data;
//             //categories.push(iData.message[i].DataDatetime);
//             //data.push(toDecimal(iData.message[i].BhExten_Value));

//             if (i == 0) {
//                 this_date = new Date(iData.message[i].DataDatetime);
//                 categories.push(iData.message[i].DataDatetime);
//                 data.push(toDecimal(iData.message[i].BhExten_Value));

//                 ddt = iData.message[i].DataDatetime;
//                 i_data = toDecimal(iData.message[i].BhExten_Value);
//             } else {
//                 next_date = new Date(iData.message[i].DataDatetime);//
//                 var add5 = add_minutes(this_date, 10);
//                 //如果相差不是五分鐘的話，代表有斷資料
//                 //if (add5.getTime() != next_date.getTime()) {
//                 //    //斷開
//                 //    categories.push(formatDate(add_minutes(this_date, 10).toString()));
//                 //    data.push(null);

//                 //    categories.push(iData.message[i].DataDatetime);
//                 //    data.push(iData.message[i].BhExten_Value);

//                 //} else {
//                 categories.push(iData.message[i].DataDatetime);
//                 data.push(toDecimal(iData.message[i].BhExten_Value));

//                 ddt = iData.message[i].DataDatetime;
//                 i_data = iData.message[i].BhExten_Value;
//                 //}

//                 this_date = next_date;//指到下一個時間

//             }

//             if (i_data != null) {
//                 content.push([ddt, i_data.toString()]);
//             }

//         }
//     }


//     Highcharts.chart('container_BhExten', {

//         title: {
//             text: NAME_C
//         },


//         xAxis: {
//             categories: categories
//         },
//         yAxis: {
//             min: -50,
//             max: 50,
//             title: {
//                 text: '伸縮量(毫米)'
//             }
//         },

//         //直接顯示數值、取消滑鼠點過去出現數值
//         //plotOptions: {
//         //    line: {
//         //        dataLabels: {
//         //            enabled: true
//         //        },
//         //        enableMouseTracking: true
//         //    }
//         //},

//         series: [{
//             name: '伸縮量 ',
//             data: data
//         }],

//         exporting: {
//             buttons: {
//                 contextButton: {
//                     menuItems: ['downloadPNG', 'downloadCSV']
//                 },
//                 anotherButton: {
//                     text: 'Download CSV',
//                     onclick: function () {

//                         downloadCSV(content, filename);
//                         //alert('You pressed another button!');
//                     }
//                 }
//             },
//             filename: filename,
//             csv: {
//                 columnHeaderFormatter: function (item, key) {
//                     if (!key) {
//                         return '時間'
//                     }
//                     return false
//                 }
//             }

//         },
//         //exporting: {
//         //    buttons: {
//         //        contextButton: {
//         //            enabled: false
//         //        },
//         //        exportButton: {
//         //            enabled: false

//         //        },
//         //        printButton: {
//         //            enabled: false

//         //        }
//         //    }
//         //},

//         responsive: {
//             rules: [{
//                 condition: {
//                     maxWidth: 500
//                 },
//                 chartOptions: {
//                     legend: {
//                         layout: 'horizontal',
//                         align: 'center',
//                         verticalAlign: 'bottom'
//                     }
//                 }
//             }]
//         }

//     });
// }


// function toDecimal(x) {
//     var f = parseFloat(x);
//     if (isNaN(f)) {
//         return "---";
//     }
//     f = Math.round(x * 100) / 100;
//     return f;
// }

// //判斷如果是null值就回傳空白
// function TimeIsNull(s) {
//     if (!s) {
//         return "";
//     } else {
//         var d = new Date(s);
//         var sDate = d.getFullYear() + "-" + d2(parseInt(d.getMonth() + 1)) + "-" + d2(d.getDate()) + " " + d2(d.getHours()) + ":" + d2(d.getMinutes()) + ":" + d2(d.getSeconds());
//         return sDate;
//     }
// }



// //datetime format
// function formatDate(dates) {
//     var date = new Date(dates);
//     var yyyy = date.getFullYear();
//     var month = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
//     var day = String(date.getDate()).padStart(2, '0');
//     var hours = String(date.getHours()).padStart(2, '0');
//     var minutes = String(date.getMinutes()).padStart(2, '0');
//     var seconds = String(date.getSeconds()).padStart(2, '0');


//     return yyyy + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
// }

// function BhLights(lights) {
//     //alert("iSUM:" + iSUM + ",X:" + X);
//     var light = "images/light_gray.png";
//     if (lights == 'gray') {
//         light = "images/light_gray.png";
//     } else if (lights == 'green') {
//         light = "images/light_green.png";
//     } else if (lights == 'blue') {
//         light = "images/light_blue.png";
//     } else if (lights == 'yellow') {
//         light = "images/light_yellow.png";
//     } else if (lights == 'red') {
//         light = "images/light_red.png";
//     }

//     return light;
// }