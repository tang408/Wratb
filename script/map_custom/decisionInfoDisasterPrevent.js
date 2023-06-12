function disasterPrevent_init() {
    if (locateType == "disasterPrevent") {
        return;
    }
    locateType = "disasterPrevent";
    parent.$("#largeInfo").hide();
    parent.$("#largeInfoFrame").attr("src", "about:blank");
    switchLayerTab("防災");
}

function switchLayerTab(layerName) {
    createLegend(layerName);
    $("input.BtnTab").removeClass("TabActive");
    $("input.BtnTab[value='" + layerName + "']").addClass("TabActive");
}

function switchTreeFolder(obj) {
    var panel = $(obj).parent();
    if ($(obj).parent().hasClass("active")) {
        panel.children("table:first").fadeOut("slow");
        var ori = panel.children("table:first").css("height");
        panel.removeClass("active");
    } else {
        panel.find("table:first").fadeIn("slow");
        panel.addClass("active");
    }
}

function swicthLayerVisible(obj, layerID) {
    var disabled = obj.checked;
    mapPlugin.layersMg.switchTheLayer(layerID, !obj.checked);
    var $checkbox = $(obj).parent().find(":checkbox");
    //if (disabled) $checkbox.prop("disabled", true);
    //$checkbox.prop("checked", !$(obj).prop("checked"));
    //if (disabled) $checkbox.prop("disabled", false);
}

function createLegend(target) {
    $("#legendTable > tbody:first").children().remove();
    if (parent.map_layers[target] && parent.map_layers[target].sub)
        createFolder($("#legendTable > tbody:first"), parent.map_layers[target].sub, "[\"" + target + "\"].sub");
}
// create layer folder
function createFolder($parentFolderTable, data) {
    for (var layerID in data) {
        $parentFolderTable.append("<tr id='trDisaterPrevent" + layerID + "'><td style='padding-right:6px; overflow:hidden;'/></tr>");
        var $tr = $parentFolderTable.find("tr:last");
        var $td = $tr.find("td:last");
        var layerInfo = data[layerID];
        $td.append("<span class='TxtBlack'>" + layerInfo.name + "</span>");
        $tr.append("<td style='padding-right:6px; overflow:hidden; width:100px;'/>");
        $td = $tr.find("td:last");
        $td.append(
            "<label class='toggleSwitch nolabel' onclick='' >"
          + "<input type='checkbox' checked id='chk_dp_" + layerID + "' onchange=\"swicthLayerVisible(this, '" + layerInfo.layerID + "')\" />"
          + "<span><span>關閉</span><span>開啟</span></span><a></a>"
          + "</label>"
          );
        if (layerInfo.type == "folder") {
            if (layerInfo.visible) $td.find(':checkbox').prop('checked', true);
            $td.addClass("TreeFolder");
            $td.append("<a href='javascript:void(0);' onclick='switchTreeFolder(this);'>" + layerInfo.name + "</a>");
            $td.append("<table path='" + layerInfo.layerID + "' style='width:100%; display:none;'/>");
            if (layerInfo.sub)
                createFolder($td.children().last(), layerInfo.sub);
        } else {
            var layer = mapPlugin.layersMg.getLayer(layerInfo);
            if (layer && layer.getVisible()) $td.find(':checkbox').prop('checked', false);
            else $td.find(':checkbox').prop('checked', true);
            // create a layer
            //$td.addClass("TreeNode");
            //if (layerInfo.legendIcon) {
            //    $td.append("<img src='" + (layerInfo.legendIcon.indexOf("http://") == 0 ? "" : "../") + layerInfo.legendIcon + "' style='width:22px; height:22px;'/>");
            //    $td.append(layerInfo.name);
            //} else if (layerInfo.legend) {
            //    var align = "left";
            //    if (layerInfo.legend.align) align = layerInfo.legend.align;
            //    if (align == "bottom") {
            //        $td.append(layerInfo.name);
            //        $td.append("<br/>");
            //        $td.append("<img src='" + (layerInfo.legend.url.indexOf("http://") == 0 ? "" : "../") + layerInfo.legend.url + "' style='padding-left:10px; width:22px; height:22px;'/>");
            //    } else {
            //        $td.append("<img src='" + (layerInfo.legend.url.indexOf("http://") == 0 ? "" : "../") + layerInfo.legend.url + "' style='width:22px; height:22px;'/>");
            //        $td.append(layerInfo.name);
            //    }
            //}
            //if (layerInfo.editable) {
            //    $td.append("<input type='button' class='BtnGrey' value='編輯' onclick=\"editLayer(this, '" + layerInfo.layerID + "')\" />");
            //}
        }
    }
}

function hideAllLayer() {
    $("#legendTable input[type='checkbox']:checked").click();
}
