var rainStID2Name = {
    "CWB": {
        "C0A570": "桶後",
        "C0A580": "屈尺"
    },
    "10": {
        "01A440": "大桶山"
    },
    "SWCB": {
        "81AH90": "信賢派出所"
    },
    "FEITSUI": {
        "L1A790": "翡翠局"
    },
    "WRATB": {
        "19-RA1": "RA1",
        "Rain01": "RA2",
        "1140H068": "屈尺堰"
    }

};

function genRainfallContent(feature, $theContent) {
    $.ajax("http://210.69.129.130/WraNBMobile104/getWraNBData.asmx/getRainfallGovByID?siteid=" + feature.get("編號"))
        .then(
            function (resp) {
                if (resp.getRainfall.length > 0) {
                    var $content = $theContent.find(".idMonitorData");
                    var strContent = "<span style='padding:2px;text-align:right;color:blue;'>當日累積雨量" + "</span>"
                        + "<span style='padding:2px; text-align:left'> " + resp.getRainfall[0].Rainfall0 + " mm" + "</span>";
                    $content.append(strContent);
                    $content.append("<br/> <span><a href='javascript:genRainfallCharts(\"" + feature.get("編號") + "\", \"" + feature.get("測站安稱") + "\")'>詳細資料</a></span>");
                } else {
                    $theContent.append("<span style='color:red'>無此測站資訊</span>");
                }
            },
            function () {
                $theContent.append("<span style='color:red'>無法取得雨量資訊</span>");
            }
        );
}

function genRainfallShemenContent(feature, $theContent) {
    var $content = $theContent.find(".idMonitorData");
    var siteName = rainStID2Name[feature.get("id")];
    $content.append("<span style='font-weight:bold;color:black'>" + siteName + "<span>");
    var strContent = "<span style='padding:2px;text-align:right;color:blue;'>當日累積雨量" + "</span>"
        + "<span style='padding:2px; text-align:left'> " + feature.get("rainfallday") + " mm" + "</span>";
    $content.append(strContent);
    $content.append("<br/> <span><a href='javascript:genRainfallCharts(\"" + feature.get("id") + "\", \"" + siteName + "\")'>詳細資料</a></span>");
}

function genRainfallCWBContent(feature, $theContent) {
    var $content = $theContent.find(".idMonitorData");
    var siteName = rainStID2Name[feature.get("id")];
    $content.append("<span style='font-weight:bold;color:black'>" + siteName + "<span>");
    var strContent = "<span style='padding:2px;text-align:right;color:blue;'>當日累積雨量" + "</span>"
        + "<span style='padding:2px; text-align:left'> " + feature.get("rainfallday") + " mm" + "</span>";
    $content.append(strContent);
    $content.append("<br/> <span><a href='javascript:genRainfallCharts(\"" + feature.get("id") + "\", \"" + siteName + "\")'>詳細資料</a></span>");
}

var $waterQualityConent = null;
var waterStaNo = null;
function getQuality(resp) {
    var bFind = false;
    for (var i = 0; i < resp.getQuality.length; i++) {
        if (resp.getQuality[i].sta_no == waterStaNo) {
            var $content = $waterQualityConent.find(".idMonitorData");
            var theDate = new Date(resp.getQuality[i].info_date + "+0800");
            if (isNaN(theDate.getDate())) {
                theDate = new Date(resp.getQuality[i].info_date);
            }
            var strContent = "<br/><span style='padding:2px;text-align:right;color:blue;'>濁度" + "</span>"
                + "<span style='padding:2px; text-align:left'> " + (resp.getQuality[i].tbd == null ? "無" : (Math.round(resp.getQuality[i].tbd * 10000) / 10000) + " NTU") + "</span>"
                + "<br> 資料時間:" + (theDate.getYear() - 11) + "/" + (theDate.getMonth() + 1) + "/" + theDate.getDate() + " " + theDate.getHours() + ":" + theDate.getMinutes();
            $content.append(strContent);
            bFind = true;
            break;
        }
    }
    if (!bFind) {
        $waterQualityConent.append("<span style='color:red'>無此測站資訊</span>");
    }
    $waterQualityConent = null;
}

var sidForBao2 = null;
function genCCTVRealTime(feature, $theContent) {
    if (feature.get('name') == '寶二水庫水尺') {
        if (sidForBao2) {
            cctvBao2($theContent);
        } else {
            $.ajax("service/proxy.ashx?url=" + encodeURIComponent("http://192.168.94.240:5000/webapi/auth.cgi?api=SYNO.API.Auth&method=Login&version=2&account=userb2&passwd=userb2&session=SurveillanceStation&format=sid"))
                .then(
                    function (resp) {
                        if (typeof (resp) == "string") {
                            resp = JSON.parse(resp);
                        }
                        if (resp.success) {
                            sidForBao2 = resp.data.sid;
                        } else {
                            alert("取得即時影像失敗!!");
                        }
                        cctvBao2($theContent);
                    }
                );
        }
    }
}

var cctvBao2Interval = null;
function cctvBao2($theContent) {
    clearInterval(cctvBao2Interval);

    var cctvBao2IntervalFunc = function () {
        var $content = $theContent.find(".idMonitorData");
        var $parent = $content.parent();
        while (true) {
            if ($parent.length == 0) {
                clearInterval(cctvBao2Interval);
                return;
            } else {
                if ($parent[0].tagName.toLowerCase() == "body") break;
                $parent = $parent.parent();
            }
        }
        if ($content.find("img").length == 0) {
            $content.append("<img style='width:400px' />");
        }
        console.log(new Date() + " get new cctv image");
        $content.find("img").attr("src", "http://192.168.94.240:5000/webapi/entry.cgi?camStm=0&version=3&cameraId=1&api=SYNO.SurveillanceStation.Camera&preview=false&method=GetSnapshot&_sid=" + sidForBao2 + "&rnd=" + (Math.random() * new Date().getTime()));
    };
    cctvBao2IntervalFunc();
    cctvBao2Interval = setInterval(cctvBao2IntervalFunc, 30000);
}
