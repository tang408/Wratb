function initFunctions() {
    var arsEnableFuncs = enableFunctions.split(",");
    $("#mapnav1 li").hide();
    for (var i = 0; i < arsEnableFuncs.length; i++) {
        $("#mapnav1 .nav_" + arsEnableFuncs[i].replace(/ /g, '')).show();
    }
}

function toolSwitch(target) {
    if (target == "fullMap") {
        mapPlugin.backToInitPosition();
        return;
    }

    $(".mapnav1 li").removeClass("active");

    // 呼叫iframe裡的page_leave事件
    $(".Box iframe").each(function () {
        if ($(this).css("display") != "none" && this.contentWindow.page_leave) {
            this.contentWindow.page_leave();
        }
    });
    $(".Box iframe").hide();
    if (!target) {
        $(".FuncBox").hide();
        return;
    }
    $(".FuncBox").show();
    switch (target) {
        case "baseMap":
            $("#ifBox01").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_01").addClass("active");
            $("#map_ct").show();

            break;
        case "measure":
            $("#ifBox02").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_02").addClass("active");
            $("#map_ct").show();
            break;
        case "rangeQuery":
            $("#ifBox03").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_03").addClass("active");
            $("#map_ct").show();

            break;
        case "locate":
            $("#ifBox04").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_04").addClass("active");
            $("#map_ct").show();

            break;
        case "legend":
            $("#ifBox05").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_05").addClass("active");
            $("#map_ct").show();

            //$("#ifBox05")[0].contentWindow.resizeLayout();
            break;
        case "imageCapture":
            $("#ifBox06").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_06").addClass("active");
            $("#map_ct").show();

            break;
        case "closeAll":
            $(".FuncBox").hide();
            $(".Box iframe").each(function () {
                if (this.contentWindow.action_clear) {
                    this.contentWindow.action_clear();
                }
            });
            break;
        case "decisionInfo":
            if ($("#ifBox08").attr("src") == "") {
                $("#ifBox08").attr("src", "Map/decisionInfo.htm");
            }
            $("#ifBox08").fadeIn("slow");
            $(".mapnav1 li").removeClass("active");
            $(".nav_08").addClass("active");
            $("#map_ct").show();

            break;
        case "backMis":
            top.showMis();
            break;
    }
    $(".Box iframe").each(function () {
        if ($(this).css("display") != "none" && this.contentWindow.page_active) {
            this.contentWindow.page_active();
        }
    });
}

function resizeBox(contentHeight) {
    var maxHieght = $("html").height() - $("#contentBox").offset().top - 10;
    for (var i = 1; i <= 7; i++) {
        if ($("#ifBox0" + i).css("display") != "none") {
            var height = contentHeight;
            if (height > maxHieght) {
                height = maxHieght;
            }
            if ($("#contentBox").height() != height) {
                $("#contentBox").height(height);
            }
            break;
        }
    }
}

function showHelp(htmlContent) {
    $('#helpContent').html(htmlContent);
    $('#helper').modal('show');
}

function showFeatureDetail(layerID, feature) {
    var serviceInfo = mapPlugin.layersMg.getLayerInfo(layerID).serviceInfo;
    if (serviceInfo.featureDetail) {
        var htmlContent = serviceInfo.featureDetail;
        htmlContent = mapPlugin.genContentFromFeature(feature, htmlContent);
        $('#featureDetailContent').html(htmlContent);
    } else {
        $('#featureDetailContent').html("");
    }
    $('#featureDetail').modal('show');
}

function showIdentifyFeatureDetail(layerID, FeatureId) {
    showFeatureDetail(layerID, mapPlugin.layersMg.getFeatureFromIdentify(layerID, FeatureId));
}

function setRainfallAggregate(feature, $theContent) {
    var url = "service/QueryRainfallData.ashx?duration=day";
    $.ajax(url, { context: { feature: feature, $theContent: $theContent } })
     .done(function (data) {
         var stNo = feature.get("st_no");
         for (var i = 0 ; i < data.length; i++) {
             if (data[i].StNo == stNo){
                 this.$theContent.find("._value").text(data[i].Value == null ? "--缺測--" : data[i].Value + ' mm');
                 var theDate = new Date(data[i].DataDatetime);
                 infoDate = (theDate.getYear() + 1900) + '/' + (theDate.getMonth() + 1) + '/' + theDate.getDate() + ' ' + theDate.getHours() + ':' + theDate.getMinutes()
                 this.$theContent.find("._datetime").text(infoDate);
             }
         }
     })
     .fail(function () {
     });
}

function setWaterlevel(feature, $theContent) {
    var url = "service/QueryWaterlevelData.ashx";
    $.ajax(url, { context: { feature: feature, $theContent: $theContent } })
     .done(function (data) {
         var stNo = feature.get("st_no");
         for (var i = 0 ; i < data.length; i++) {
             if (data[i].StNo == stNo) {
                 this.$theContent.find("._value").text(data[i].Value == null ? "--缺測--" : data[i].Value + ' M');
                 var theDate = new Date(data[i].DataDatetime);
                 infoDate = (theDate.getYear() + 1900) + '/' + (theDate.getMonth() + 1) + '/' + theDate.getDate() + ' ' + theDate.getHours() + ':' + theDate.getMinutes()
                 this.$theContent.find("._datetime").text(infoDate);
             }
         }
     })
     .fail(function () {
     });
}

function setTurb(feature, $theContent) {
    var url = "service/QueryTurbData.ashx";
    $.ajax(url, { context: { feature: feature, $theContent: $theContent } })
     .done(function (data) {
         var stNo = feature.get("st_no");
         for (var i = 0 ; i < data.length; i++) {
             if (data[i].StNo == stNo) {
                 this.$theContent.find("._value").text(data[i].Value == null ? "--缺測--" : data[i].Value + ' NTU');
                 var theDate = new Date(data[i].DataDatetime);
                 infoDate = (theDate.getYear() + 1900) + '/' + (theDate.getMonth() + 1) + '/' + theDate.getDate() + ' ' + theDate.getHours() + ':' + theDate.getMinutes()
                 this.$theContent.find("._datetime").text(infoDate);
             }
         }
     })
     .fail(function () {
     });
}
