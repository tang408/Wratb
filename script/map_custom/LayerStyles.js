var rainfallData = null;
var rainfallDataGrabTime = new Date().setMinutes(new Date().getMinutes() - 3);
var isGettingRainfaillData = false;

function getRainfallData() {
    if (!isGettingRainfaillData) {
        isGettingRainfaillData = true;
        var url = "service/getRainfallData.ashx";
        $.get(url)
         .success(setRainfallData);
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

    $("#ifBox08")[0].contentWindow.resetRainfallData(rainfallData);
}


var rainfallDataCWB = null;
var rainfallDataCWBGrabTime = new Date().setMinutes(new Date().getMinutes() - 3);
var isGettingRainfaillDataCWB = false;
var rainfallCWBGroups = ["上坪堰", "三峽", "鳶山堰", "桃灌", "石灌"];
var rianfallCWBGroupIDs = ["shangping", "sanxia", "yuanshan", "taoguan", "shiguan"];
function getRainfallStyleCWB(feature) {
    var icon_postfix = "grey";
    if (rainfallDataCWB && new Date().setMinutes(new Date().getMinutes() - 3) < rainfallDataCWBGrabTime) {
        if (feature.getKeys().indexOf("updateTime") < 0) {
            resetRainfallDataCWB(false);
        }
        var in24hr = feature.get("rainfall24h");
        var in3hr = feature.get("rainfall3h");
        var in1hr = feature.get("rainfall1h");
        if (in24hr != null && in24hr >= 500) {
            icon_postfix = "darkred";
        } else if (in24hr != null && in24hr >= 350) {
            icon_postfix = "r";
        } else if (in24hr != null && in24hr >= 200) {
            icon_postfix = "o";
        } else if (in24hr != null && in24hr >= 80) {
            icon_postfix = "y";
        } else {
            if (in3hr != null && in3hr >= 100) {
                icon_postfix = "o";
            } else {
                if (in1hr != null && in1hr >= 40) {
                    icon_postfix = "y";
                } else {
                    if (in24hr != null || in3hr != null || in1hr != null) {
                        icon_postfix = "g";
                    }
                }
            }
        }
    } else {
        getRainfallDataCWB();
    }
    return oltmx.util.Tools.getStyleFromOption({
        icon: {
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'images/map_legend/rain_gauge_' + icon_postfix + '.svg',
            imgSize: [32, 32]
        }
    });
}

function getRainfallDataCWB() {
    if (!isGettingRainfaillDataCWB) {
        isGettingRainfaillDataCWB = true;
        var url = wranbCloudUrl + "/getWraNBData.asmx/getRainfallGov?callback=setRainfallDataCWB";
        $("body").append("<script type='text/javascript' src='" + url + "'><" + "/script>");
    }
}

function setRainfallDataCWB(data) {
    if (data && data.getRainfall) {
        rainfallDataCWB = data.getRainfall;
        isGettingRainfaillDataCWB = false;
        rainfallDataCWBGrabTime = new Date().getTime();
    }
    if (rainfallDataCWB) {
        resetRainfallDataCWB(true);
    }
}

function resetRainfallDataCWB(bRender) {
    for (var gIdx = 0; gIdx < rainfallCWBGroups.length; gIdx++) {
        var layer = mapPlugin.layersMg.getLayer("監測資訊/雨量站/" + rainfallCWBGroups[gIdx]);
        if (!layer) continue;
        var features = layer.getSource().getFeatures();
        if (features.length == 0) return;
        var properties = [];
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var siteID = feature.get("id");
            var siteData = null;
            for (var j = 0; j < rainfallDataCWB.length; j++) {
                if (rainfallDataCWB[j]["SiteID"] == siteID) {
                    siteData = rainfallDataCWB[j];
                    break;
                }
            }

            feature.set("rainfallday", null);
            feature.set("rainfall10m", null);
            feature.set("rainfall1h", null);
            feature.set("rainfall3h", null);
            feature.set("rainfall6h", null);
            feature.set("rainfall12h", null);
            feature.set("rainfall24h", null);
            feature.set('updateTime', null);

            if (!siteData) continue;

            feature.set("rainfallday", siteData["Rainfall0"]);
            feature.set("rainfall10m", siteData["Rainfall1"]);
            feature.set("rainfall1h", siteData["Rainfall2"]);
            feature.set("rainfall3h", siteData["Rainfall3"]);
            feature.set("rainfall6h", siteData["Rainfall4"]);
            feature.set("rainfall12h", siteData["Rainfall5"]);
            feature.set("rainfall24h", siteData["Rainfall6"]);

            feature.set('updateTime', siteData["PublishTime"]);
            properties.push(feature.getProperties());
        }
        $("#ifBox08")[0].contentWindow.resetRainfallData(properties, rianfallCWBGroupIDs[gIdx]);
    }
    if (bRender) {
        map.render();
    }
}