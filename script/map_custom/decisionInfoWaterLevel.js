var waterLevelStationName = {
    
    "WRATB": {
        "SB-4": "ZZ-B3-5P",
        //"ST_15": "ZZ-A1-1",
        //"ST_16": "ZZ-A1-2",
        //"ST_17": "ZZ-B5-7P",
        "18-4BW": "ZZ-C4-1P",
        "18-5BW": "ZZ-D1-1P",
        "18-6BW": "ZZ-C3-1P",
        //"ST_21": "ZZ-C3-2",
        "18-8BW": "ZZ-C6-1P",
        "18-9BW": "ZZ-C7-2P",
        "18-1W": "ZZ-B3-10P",
        "18-3BW*": "ZZ-B3-13P",
        "18-5W-Up": "ZZ-B3-11P@20m",
        "18-5W-Below": "ZZ-B3-11P@37m",
        //"ST_31": "ZZ-B3-1W",
        //"ST_32": "ZZ-B6-1W",
        //"ST_33": "ZZ-B6-2",
        //"ST_34": "ZZ-B5-2W",
        //"ST_35": "ZZ-B5-4W",
        //"ST_36": "ZZ-B7-1W",
        //"ST_37": "ZZ-B8-1",
        //"ST_38": "ZZ-B5-8"
        "ZZ-19C01": "ZZ-C5-1P",
        "ZZ-19C03": "ZZ-C7-1P"
    }
};

var isWaterlevelStationGen = false;
var isGettingWaterlevelData = false;

var waterLevelStation;

function waterlevel_init() {
    if (locateType == "waterlevel") {
        return;
    }
    locateType = "waterlevel";
    switchLayer(true);
    genWaterlevelStations();
    if (parent.$("#largeInfoFrame").attr("src") != "Map/decisionInfo_WaterLevel.htm") {
        parent.$("#largeInfoFrame").attr("src", "Map/decisionInfo_WaterLevel.htm");
        console.log("html to WaterLevel");
    }
    getWaterLevelStations();
    // 每分鐘更新一次資料
    if (dataInterval != null) {
        clearInterval(dataInterval);
    }
    dataInterval = setInterval(getWaterLevelStations, 60000);
}

function genWaterlevelStations() {
    if (isWaterlevelStationGen) return;
    for (var unitID in waterLevelStationName) {
        var $unitPanel = $("#tableWL_" + unitID);
        if ($unitPanel.length == 0) continue;
        for (var stID in waterLevelStationName[unitID]) {
            var stName = waterLevelStationName[unitID][stID];
            if ($("#tr" + stID).length == 1) continue;
            $unitPanel.append(
                '<tr id="trWL_' + stID + '">' +
                '<td><img src="../Images/map_legend/water_level_gauge_' + unitID + '.svg" /></td>' +
                '<td><span class="TxtBlack">' + stName + '</span></td>' +
                '<td><span class="TxtNumO">--</span><span class="TxtUnit">M</span><span class="TxtTime">--</span></td>' +
                '<td width="120">' +
                '<input type="submit" name="button" class="BtnPin" value="" onclick="locateToWaterLevel(\'' + unitID + '\',\'' + stID + '\')" />' +
                '<label class="toggleSwitch nolabel" onclick="">' +
                '<input id="chk_wl_' + stID + '" type="checkbox" checked onchange="switchWaterLevelChart(\'' + stID + '\',\'' + stName + '\')"/>' +
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
    isWaterlevelStationGen = true;
}

function getWaterLevelStations() {
    if (!isGettingWaterlevelData) {
        isGettingWaterlevelData = true;
        var url = "../service/QueryWaterlevelData.ashx";
        $.get(url)
            .done(resetWaterLevelData)
            .fail(function () {
                isGettingWaterlevelData = false;
            });
    }
}

function resetWaterLevelData(data) {
    if (dataInterval) {
        clearInterval(dataInterval);
        dataInterval = null;
    }
    isGettingWaterlevelData = false;

    waterLevelStation = data;

    var classData = [];
    for (var i = 0; i < waterLevelStation.length; i++) {
        classData.push(waterLevelStation[i]);
    }

    for (var i = 0; i < classData.length; i++) {
        var stData = classData[i];
        var infoDate = null;
        var $trPanel = $("#trWL_" + stData.StNo);
        if (stData.DataDatetime) {
            var theDate = new Date(stData.DataDatetime);
            infoDate = (theDate.getYear() + 1900) + '/' + (theDate.getMonth() + 1) + '/' + theDate.getDate() + '<br />' + theDate.getHours() + ':' + theDate.getMinutes()
        } else {
            infoDate = "------";
        }
        value = stData.Value;
        $trPanel.find(".TxtNumO").text((value == null ? "--缺測--" : value.toFixed(3)));
        $trPanel.find(".TxtNumO").attr("class", "TxtNumO");
        //$trPanel.find("._value").addClass(getRainfallLevelClass(stData));
        $trPanel.find(".TxtTime").html(infoDate);
    }
}

function locateToWaterLevel(unitID, sta_no) {
    dataUrl = "../Service/GetLocationInfo.ashx?data=waterlevel&layer=" + unitID + "&siteID=" + sta_no;
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

function switchWaterLevelChart(sta_no, name_c) {
    var $chart = parent.$("#largeInfo");
    if ($chart.css("display") == "none") {
        $chart.show(
            {
                duration: 300,
                easing: 'linear',
                complete: function () {
                    if ($("#chk_wl_" + sta_no).prop("checked")) {
                        setTimeout(function () {
                            parent.decisionInfo.waterLevel.removeStation(sta_no);
                        }, 300);
                    } else {
                        setTimeout(function () {
                            parent.decisionInfo.waterLevel.addStation(sta_no, name_c);
                        }, 300);
                    }
                }
            }
        );
    } else {
        if ($("#chk_wl_" + sta_no).prop("checked")) {
            setTimeout(function () {
                parent.decisionInfo.waterLevel.removeStation(sta_no);
            }, 300);
        } else {
            setTimeout(function () {
                parent.decisionInfo.waterLevel.addStation(sta_no, name_c);
            }, 300);
        }
    }
    switchLayer(true);
}