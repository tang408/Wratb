var tbdStation = null;
var tbdClass = "NW";

var isTBDStationGen = false;
var isGettingTBDData = false;

var tbdStationName = {
    "WRATB": {
        "1140H087": "下龜山橋",
        "1140H103": "烏來橋",
        "1140H095": "覽勝橋"
    }
};

function tbd_init() {
    if (locateType == "tbd") {
        return;
    }
    if (locateType == "") locateType = "tbd";
    locateType = "tbd";
    genTurbStations();
    switchLayer(true);
    if (parent.$("#largeInfoFrame").attr("src") != "Map/decisionInfo_TBD.htm") {
        parent.$("#largeInfoFrame").attr("src", "Map/decisionInfo_TBD.htm");
    }
    getTBDStations();
    // 每分鐘更新一次資料
    if (dataInterval != null) {
        clearInterval(dataInterval);
    }
    dataInterval = setInterval(getTBDStations, 60000);
}

function genTurbStations() {
    if (isTBDStationGen) return;
    for (var unitID in tbdStationName) {
        var $unitPanel = $("#tableTBD_" + unitID);
        if ($unitPanel.length == 0) continue;
        for (var stID in tbdStationName[unitID]) {
            var stName = tbdStationName[unitID][stID];
            $unitPanel.append(
                '<tr id="trTBD_' + stID + '">' +
                    '<td><img src="../Images/map_legend/turbidometer_' + unitID + '.svg" /></td>' +
                    '<td><span class="TxtBlack">' + stName + '</span></td>' +
                    '<td><span class="TxtNumO">--</span><span class="TxtUnit">NTU</span><span class="TxtTime">--</span></td>' +
                    '<td width="120">' +
                        '<input type="submit" name="button" class="BtnPin" value="" onclick="locateToTBD(\'' + unitID + '\',\'' + stID + '\')" />' +
                        '<label class="toggleSwitch nolabel" onclick="">' +
                            '<input id="chk_tbd_' + stID + '" type="checkbox" checked onchange="switchTBDChart(\'' + stID + '\',\'' + stName + '\')"/>' +
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
    isTBDStationGen = true;
}

function getTBDStations() {
    if (!isGettingTBDData) {
        isGettingTBDData = true;
        var url = "../service/QueryTurbData.ashx";
        $.get(url)
         .done(resetTBDData)
         .fail(function () {
             isGettingTBDData = false;
         });
    }
}

function resetTBDData(data) {
    isGettingTBDData = false;
    tbdStation = data;
    var value;
    for (var i = 0; i < tbdStation.length; i++) {
        var stData = tbdStation[i];
        var infoDate = null;
        var $trPanel = $("#trTBD_" + stData.StNo);
        if (stData.DataDatetime) {
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
}

function locateToTBD(unitID, sta_no) {
    dataUrl = "../Service/GetLocationInfo.ashx?data=turb&layer=" + unitID + "&siteID=" + sta_no;
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

function switchTBDChart(sta_no, name_c) {
    var $chart = parent.$("#largeInfo");
    if ($chart.css("display") == "none") {
        $chart.show(
                    {
                        duration: 300,
                        easing: 'linear',
                        complete: function () {
                            if ($("#chk_tbd_" + sta_no).length > 0) {
                                if ($("#chk_tbd_" + sta_no).prop("checked")) {
                                    setTimeout(function () {
                                        parent.decisionInfo.tbd.removeStation(sta_no);
                                    }, 300);
                                } else {
                                    setTimeout(function () {
                                        parent.decisionInfo.tbd.addStation(sta_no, name_c);
                                    }, 300);
                                }
                            }
                        }
                    }
                );
    } else {
        if ($("#chk_" + sta_no).prop("checked")) {
            setTimeout(function () {
                parent.decisionInfo.tbd.removeStation(sta_no);
            }, 300);
        } else {
            setTimeout(function () {
                parent.decisionInfo.tbd.addStation(sta_no, name_c);
            }, 300);
        }
    }
    switchLayer(true);
}
