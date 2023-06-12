var rainfallStationName = parent.rainStID2Name;


var rainfallClass = "shemen";
var rainfallAccType = "day";
// 是否已經建立測站於web
var isRainfallStationGen = false;
var isGettingRainfaillData = false;

var stationDataUrl = "";

var rainfallStation;
function rainfall_init() {
    genRainStations();
    if (locateType == "rainfall") {
        return;
    }
    locateType = "rainfall";
    switchLayer(true);
    if (parent.$("#largeInfoFrame").attr("src") != "Map/decisionInfo_rainfall.htm") {
        parent.$("#largeInfoFrame").attr("src", "Map/decisionInfo_rainfall.htm");
        console.log("html to rainfall");
    }
    getRainfallStations();
    // 每分鐘更新一次資料
    if (dataInterval != null) {
        clearInterval(dataInterval);
    }
    // 資料會從Map.aspx(LayerStyles.js)來
    dataInterval = setInterval(getRainfallStations, 500);
}

function genRainStations() {
    if (isRainfallStationGen) return;
    for (var unitID in rainfallStationName) {
        var $unitPanel = $("#tableRF_" + unitID);
        if ($unitPanel.length == 0) continue;
        for (var stID in rainfallStationName[unitID]) {
            var stName = rainfallStationName[unitID][stID];
            if ($("#tr" + stID).length == 1) continue;
            $unitPanel.append(
                '<tr id="trRF_' + stID + '">' +
                    '<td><img src="../Images/map_legend/rain_gauge_' + unitID + '.svg" /></td>' +
                    '<td><span class="TxtBlack">' + stName + '</span></td>' +
                    '<td><span class="TxtNumO">--</span><span class="TxtUnit">mm</span><span class="TxtTime">--</span></td>' +
                    '<td width="120">' +
                        '<input type="submit" name="button" class="BtnPin" value="" onclick="locateToRainfall(\'' + unitID + '\',\'' + stID + '\')" />' +
                        '<label class="toggleSwitch nolabel" onclick="">' +
                            '<input id="chk_rf_'+stID+'" type="checkbox" checked onchange="switchRainfallChart(\'' + stID + '\',\'' + stName + '\')"/>' +
                            '<span>' +
                                '<span>關閉歷線</span>' +
                                '<span>開啟歷線</span>' +
                            '</span>' +
                            '<a></a>' +
                        '</label>' +
                    '</td>' +
                '</tr>'
            );
        }
    }
    isRainfallStationGen = true;
}

function rainfallClassChange(obj, val) {
    $("#ddlRainfallClass span.dropdown-text").text($(obj).text());
    $("input[id^='chk_rf_']:not(:checked)").each(
                function () {
                    $(this).prop("checked", true);
                    switchRainfallChart(this.id.replace('chk_rf_', ''));
                }
            );

    if (parent.decisionInfo.rainfall) {
        parent.decisionInfo.rainfall.createHightChart(true);
    }

    switchLayer(false);
    rainfallClass = val;
    switchLayer(true);
    $("#lvRainfall > tbody > tr").remove();
    getRainfallStations();
}

function rainfallAccTypeChange(obj, val) {
    $("#ddlRainfallAccType span.dropdown-text").text($(obj).text());

    rainfallAccType = val;
    //$("#lvRainfall > tbody > tr").remove();
    getRainfallStations();
}


function getRainfallStations(callbackFunc) {
    if (!isGettingRainfaillData) {
        isGettingRainfaillData = true;
        var url = "../service/QueryRainfallData.ashx?duration=" + rainfallAccType;
        $.get(url)
         .done(setRainfallData)
         .fail(function () {
             isGettingRainfaillData = false;
         });
    }
}

function setRainfallData(data) {
    if (data) {
        rainfallData = data;
        isGettingRainfaillData = false;
        rainfallDataGrabTime = new Date().getTime();
    }
    if (!rainfallData) {
        return;
    }

    resetRainfallData(rainfallData);
}

function resetRainfallData(data) {
    if (dataInterval) {
        clearInterval(dataInterval);
        dataInterval = null;
    }

    var classData = [];
    classData = data;

    var value;

    for (var i = 0; i < classData.length; i++) {
        var stData = classData[i];
        var $trPanel = $("#trRF_" + stData.StNo);
        var infoDate = null;
        if (classData[i].DataDatetime) {
            var theDate = new Date(stData.DataDatetime);
            infoDate = (theDate.getYear() + 1900) + '/' + (theDate.getMonth() + 1) + '/' + theDate.getDate() + '<br />' + theDate.getHours() + ':' + theDate.getMinutes()
        } else {
            infoDate = "------";
        }

        value = stData.Value;
        if (value == null) {
            value = "資料中斷";
        }
        else if (value == -9999 || value == -999999) {
            value = "--缺測--";
        }

        $trPanel.find(".TxtNumO").text(value);
        $trPanel.find(".TxtNumO").attr("class", "TxtNumO");
        //$trPanel.find("._value").addClass(getRainfallLevelClass(stData));
        $trPanel.find(".TxtTime").html(infoDate);
    }

    //if ($lvRow.length > 0) {
        dataInterval = setInterval(getRainfallStations, 60000);
    //}
}

function locateToRainfall(unitID, sta_no) {
    dataUrl = "../Service/GetLocationInfo.ashx?data=rainfall&layer=" + unitID + "&siteID=" + sta_no;
    var proj = "EPSG:3826";
    switchLayer(true);
    $.ajax({
        url: dataUrl,
        success: function (data) {
            var ret = parent.mapPlugin.locateTool.locateToWKT(data, proj, false);
            setTimeout(function () {
                var coord = [(ret.extent[0] + ret.extent[2]) / 2, (ret.extent[1] + ret.extent[3]) / 2];
                parent.mapPlugin.layersMg.identifyLayersByGroup(coord);
            }, 200);
        }
    });
}

function switchRainfallChart(sta_no, name_c) {
    var $chart = parent.$("#largeInfo");
    if ($chart.css("display") == "none") {
        $chart.show(
                    {
                        duration: 300,
                        easing: 'linear',
                        complete: function () {
                            if ($("#chk_rf_" + sta_no).length > 0) {
                                if ($("#chk_rf_" + sta_no).prop("checked")) {
                                    setTimeout(function () {
                                        parent.decisionInfo.rainfall.removeStation(sta_no);
                                    }, 300);
                                } else {
                                    setTimeout(function () {
                                        parent.decisionInfo.rainfall.addStation(sta_no, name_c);
                                    }, 300);
                                }
                            }
                        }
                    }
                );
    } else {
        if ($("#chk_rf_" + sta_no).prop("checked")) {
            setTimeout(function () {
                parent.decisionInfo.rainfall.removeStation(sta_no);
            }, 300);
        } else {
            setTimeout(function () {
                parent.decisionInfo.rainfall.addStation(sta_no, name_c);
            }, 300);
        }
    }
    switchLayer(true);
}

function getRainfallLevelClass(stData) {
    var in24hr = stData["rainfall24h"];
    var in3hr = stData["rainfall3h"];
    var in1hr = stData["rainfall1h"];
    var txtClass = "";
    if (in24hr != null && in24hr >= 500) {
        txtClass = "TxtNumDR";
    } else if (in24hr != null && in24hr >= 350) {
        txtClass = "TxtNumR";
    } else if (in24hr != null && in24hr >= 200) {
        txtClass = "TxtNumO";
    } else if (in24hr != null && in24hr >= 80) {
        txtClass = "TxtNumY";
    } else {
        if (in3hr != null && in3hr >= 100) {
            txtClass = "TxtNumO";
        } else {
            if (in1hr != null && in1hr >= 40) {
                txtClass = "TxtNumY";
            } else {
                if (in24hr != null || in3hr != null || in1hr != null) {
                    txtClass = "TxtNumG";
                }
            }
        }
    }
    return txtClass;
}