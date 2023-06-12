/*
*===============================================================================
* namespace : oltmx
*  ol3 extension developed by TMD
*===============================================================================
*/
var wgs84Sphere = new ol.Sphere(6378137);

function loadjsfile(filename, filetype) {
    var fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filePath);
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
}

function loadcssfile(filePath) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filePath);
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
}

/**
* openlayers3 TM extention
* @namespace
*/
var oltmx = {};


/**
* @namespace
*/
oltmx.util = {};
/**
* @summary 常用工具
* @class
*/
oltmx.util.Tools = {};

/**
* @summary 將geometry從srcPrj的坐標系統轉成圖台的坐標系統
* @param {ol.Map} map 圖台
* @param {ol.geom.Geometry} geom 任何繼承ol.geom.Geometry的空間幾何
* @param {string|ol.proj.Projection} srcPrj `geom`的坐標系統
* @return {ol.geom.Geometry} clone `geom` 然後將空間資料轉成圖台使用的坐標系統
* @protected
*/
oltmx.util.Tools.toMapGeom = function (map, geom, srcPrj) {
    return geom.clone().transform(srcPrj, map.getView().getProjection());
};

/**
* @summary 從圖層管理資訊中取得指定的圖層資訊
* @param {string|entity.LayerInfo} layerInfoOrID layerID 或 layerInfo
* @param {entity.LayerInfo} layersObj 圖層管理資訊
* @return {entity.LayerInfo} 指定的圖層資訊
* @protected
*/
oltmx.util.Tools.getLayerInfo = function (layerInfoOrID, layersObj) {
    if (!layerInfoOrID) {
        return layersObj;
    }
    if (typeof (layerInfoOrID) != "string") {
        return layerInfoOrID;
    }
    var path = layerInfoOrID.split("/");
    if (path.length == 0) return layersInfo;
    var joinToken = '"].sub["';
    var evalPath = '["' + path.join(joinToken) + '"]';

    try {
        return eval("layersObj" + evalPath);
    } catch (e) {
        return null;
    }
};

/**
* @summary 利用config產生ol.style.Style
* @desc 可參考ol.style.Style的建構options
*       但為了跟ol3只有低耦合度，所以建構的options，也不須new ol3的class，<br/>
*       只取其所有的建構options <br/>
*       如，產生circle style 的 options<br/>
*       
*     {
*         radius: 10,
*         fill: {color:"#00FF00"}, // ol.style.Fill的建構options
*         stroke: {color:"#FF0000", width: 3} // ol.style.Storke的建構options
*     }
*       
* @param {object} config options for style  
*                        config.icon : ol.style.Icon 的建構 options  
*                        config.circle : ol.style.Circle 的建構 options  
*                        config.regularShape : ol.style.RegularShape 的建構 options  
*                        **icon, circle, regularShape 只可以三擇一**  
*                        config.fill : ol.style.Fill 的建構 options  
*                        config.stroke : ol.style.Stroke 的建構 options  
* @return {ol.style.Style} 產生的Style
*/
oltmx.util.Tools.getStyleFromOption = function (config, feature) {
    if (!config) {
        return null;
    }
    if (typeof (config) === "function") {
        return config;
    }
    var pointStyle = null;
    var textStyle = null;
    if (config.icon) {
        pointStyle = new ol.style.Icon(config.icon);
    }
    if (config.circle) {
        pointStyle = new ol.style.Circle(
            {
                radius: config.circle.radius,
                fill: new ol.style.Fill(config.circle.fill),
                stroke: new ol.style.Stroke(config.circle.stroke)
            }
        );
    }
    if (config.regularShape) {
        pointStyle = new ol.style.RegularShape(
            {
                points: config.regularShape.points,
                radius: config.regularShape.radius,
                radius1: config.regularShape.radius1,
                radius2: config.regularShape.radius2,
                angle: config.regularShape.angle,
                rotation: config.regularShape.rotation,
                fill: new ol.style.Fill(config.regularShape.fill),
                stroke: new ol.style.Stroke(config.regularShape.stroke)
            }
        );
    }
    if (config.chart) {
        pointStyle = new ol.style.Chart(
            {
                type: config.chart.type,
                radius: config.chart.radius,
                offsetY: config.chart.offsetY,
                data: config.chart.data,
                colors: config.chart.colors,
                rotateWithView: config.chart.rotateWithView,
                animation: config.chart.animation,
                stroke: new ol.style.Stroke(config.chart.stroke),
            }
        )
    }
    if (config.text && feature) {
        var textOptions = JSON.parse(JSON.stringify(config.text));
        textOptions.fill = config.text.fill ? new ol.style.Fill(config.text.fill) : undefined;
        textOptions.stroke = config.text.stroke ? new ol.style.Stroke(config.text.stroke) : undefined;
        if (config.text.labelField) {
            textOptions.text = feature.get(config.text.labelField);
        } else if (config.text.labelTemplate) {
            textOptions.text = oltmx.util.Tools.genContentFromFeature(feature, config.text.labelTemplate);
        }
        textStyle = new ol.style.Text(textOptions);
    }
    return new ol.style.Style({
        fill: (config.fill ? new ol.style.Fill(config.fill) : null),
        stroke: (config.stroke ? new ol.style.Stroke(config.stroke) : null),
        image: pointStyle,
        text: textStyle
    });
};

oltmx.util.Tools.regexTemplateVar = /(\{)([^}]+)(\})/ig;
/**
* @summary 依據template產生feature的內容
* @param {ol.Feature} 圖徵
* @param {string} 內容的template
* @return {string} 產生的內容
*/
oltmx.util.Tools.genContentFromFeature = function (feature, templateContent) {
    var htmlContent = templateContent;
    var fieldNames = feature.getKeys();
    oltmx.util.Tools.regexTemplateVar.lastIndex = 0;
    var searchResult;
    var keys = feature.getKeys();
    var lowerCaseKeys = [];
    for (var i = 0; i < keys.length; i++) {
        lowerCaseKeys.push(keys[i].toLowerCase());
    }
    while (true) {
        searchResult = oltmx.util.Tools.regexTemplateVar.exec(htmlContent);
        if (!searchResult) break;
        try {
            var matchText = searchResult[2];
            var funcIdx = matchText.indexOf("fn:") + 3;
            var replaceText = null;
            if (funcIdx > 2) {
                replaceText = eval(matchText.substr(funcIdx))(feature);
            } else if (matchText == "$Id") {
                replaceText = feature.getId();
            } else {
                matchText = keys[lowerCaseKeys.indexOf(matchText.toLowerCase())];
                replaceText = feature.get(matchText);
            }
            if (replaceText == null) {
                replaceText = "";
            }
            htmlContent = htmlContent.substr(0, searchResult.index)
                + (replaceText == null ? "" : replaceText)
                + htmlContent.substr(searchResult.index + searchResult[0].length);
            oltmx.util.Tools.regexTemplateVar.lastIndex = searchResult.index + replaceText.length;
        } catch (e) {
            oltmx.util.Tools.regexTemplateVar.lastIndex = searchResult.index + searchResult[0].length;
        }
    }
    return htmlContent;
}

oltmx.util.Tools.approxResolutionEqual = function (res1, res2) {
    var maxRes = res2;
    if (res1 > res2) {
        maxRes = res1;
    }
    if ((Math.abs(res1 - res2) / maxRes) < 0.000001) {
        return true;
    } else {
        return false;
    }
}

/**
* @summary 將經緯度坐標(float array)轉成度分秒的文字
* @param {float[]} latlon - 指定的圖層
* @param {string} separator 度分秒的分隔字串，如果是null，則為", "
* @param {string[]} arUnits 要顯示度分秒的方式，如果是null，則為["°", "'", "''"]
* @return {string} 以度分秒顯示經緯度
*/
oltmx.util.Tools.toDMSLatLon = function (latlon, separator, arUnits) {
    if (!arUnits || !$.isArray(arUnits) || arUnits.length != 3) {
        arUnits = ["°", "'", "''"];
    }
    if (!separator) {
        separator = ", ";
    }
    var ret = "";
    var val = latlon[1];
    for (var i = 0; i < arUnits.length; i++) {
        ret += Math.floor(val) + arUnits[i];
        val = (val - Math.floor(val)) * 60;
    }
    ret += separator;
    val = latlon[0];
    for (var i = 0; i < arUnits.length; i++) {
        ret += Math.floor(val) + arUnits[i];
        val = (val - Math.floor(val)) * 60;
    }
    return ret;
}


/*
* options = {
*     actives : [
*       {
*           id : "LayersMg",
*           params : {
*               mapLayers : map_Layers // 圖層設定JSON
*           }
*       },
*       {
*           id : "MeasureLengthTool"
*       }
*     }
*
* }
*/

/**
* openlayer3 TM Plugins.
* @class
* @constructor
* @param {ol.Map} _map The map.
* @param {object} options Options for controlling the operation.
*/
oltmx.Plugin = function (_map, options) {
    var LEFT_CLICK_FUNC_PLUGIN_GET_COORDINATE = "plugin_get_coordinate";

    var options = options;

    // ol3 map
    var map = _map;
    this.getMap = function () { return map };
    var currentPosition;
    var geolocation;
    options = options || {};

    if (typeof (options.showBubble) != "boolean") {
        options.showBubble = true;
    }

    this.displayPrj = options.displayPrj || this.displayPrj;
    displayPrj = options.displayPrj || displayPrj;
    htmlCaptureService = options.htmlCaptureService || htmlCaptureService;
    locatingPointZoom = options.locatingPointZoom || locatingPointZoom;
    useGeodesicMeasures = options.useGeodesicMeasures || useGeodesicMeasures;
    startAreaMeasureMsg = options.startAreaMeasureMsg || startAreaMeasureMsg;
    getCoordinateHelpMsg = options.getCoordinateHelpMsg || getCoordinateHelpMsg;
    continueAreaMeasureMsg = options.continueAreaMeasureMsg || continueAreaMeasureMsg;
    startLengthMeasureMsg = options.startLengthMeasureMsg || startLengthMeasureMsg;
    continueLengthMeasureMsg = options.continueLengthMeasureMsg || continueLengthMeasureMsg;
    constAutoGenBubbleInfo = options.constAutoGenBubbleInfo || constAutoGenBubbleInfo;
    defaultBubbleContainerHTML = options.defaultBubbleContainerHTML || defaultBubbleContainerHTML;
    defaultStyle = options.defaultStyle || defaultStyle;

    var activedTools = [];
    var me = this;

    this.measureLengthTool = null;
    this.measureAreaTool = null;
    this.locateTool = null;
    this.layersMg = null;
    this.editorTool = null;

    // layer groups
    var baseLayerGroup = new ol.layer.Group({ zIndex: 10 });
    var imageGroup = new ol.layer.Group({ zIndex: 20 });
    var polygonGroup = new ol.layer.Group({ zIndex: 30 });
    var polylineGroup = new ol.layer.Group({ zIndex: 40 });
    var pointGroup = new ol.layer.Group({ zIndex: 50 });
    var unknownTypeGroup = new ol.layer.Group({ zIndex: 60 });
    var measureGroup = new ol.layer.Group({ zIndex: 70 });

    map.addLayer(baseLayerGroup);
    map.addLayer(imageGroup);
    map.addLayer(polygonGroup);
    map.addLayer(unknownTypeGroup);
    map.addLayer(polylineGroup);
    map.addLayer(pointGroup);
    map.addLayer(measureGroup);

    // 所有臨時向量圖層
    var vectorLayers = {};
    var vectorSources = {};
    var vectorFeatureOriStyle = {};
    var nextFeatureIDs = { "default": 0 };

    /**
    * @summary 取得指定的圖層群組
    * @desc
    * groupID could be following: <br/>
    * "baseMap" <br/>
    * "image" <br/>
    * "polygon" <br/>
    * "polyline" <br/>
    * "point" <br/>
    * "unknownType" : 未知型態的圖層 <br/>
    * "measure" : 量測用的圖徵 <br/>
    * @param {string} groupID 圖層群組ID
    * @return {ol.layer.Group} 圖層群組
    */
    this.getLayerGroup = function (groupID) {
        return eval(groupID + "Group");
    };

    /**
    * @summary 取得未知型態的圖層
    */
    this.getUnknowTypeGroup = function () {
        return unknownTypeGroup;
    };

    /**
    * @summary 取得底圖圖層群組
    * @desc 底圖的圖層都要放這
    * @return {ol.layer.Group} 圖層群組
    */
    this.getBaseLayerGroup = function () {
        return baseLayerGroup;
    }

    //================================================
    //  map utility
    //================================================

    /**
    * @summary 將feature的coordinates從指定的坐標系統轉換成圖台的坐標系統
    * @param {ol.Feature} feature 圖徵
    * @param {ol.proj.Projection} srcPrj 圖徵坐標系統
    */
    this.setFeatureCoords = function (feature, srcPrj) {
        feature.setCoordinates(this.transCoordinateToMapPrj(feature.getCoordinates(), srcPrj));
    }

    /**
    * @summary 轉換坐標成圖台的坐標系統
    * @param {ol.Coordinate|ol.Coordinate[]} coords 一個或多個坐標
    * @param {string|ol.proj.Projection} srcPrj 坐標的坐標系統
    * @return {ol.Coordinate|ol.Coordinate[]} 轉換後的坐標
    */
    this.transCoordinateToMapPrj = function (coords, srcPrj) {
        if (!ol.proj.Projection.prototype.isPrototypeOf(srcPrj)) {
            srcPrj = ol.proj.get(srcPrj);
        }
        targetPrj = map.getView().getProjection();

        if ($.isArray(coords[0])) {
            var ret = [];
            for (var idx = 0; idx < coords.length; idx++) {
                ret.push(this.transCoordinateToMapPrj(coords[idx], srcPrj));
            }
            return ret;
        } else {
            return ol.proj.transform(coords, srcPrj, targetPrj);
        }
    }

    /**
    * @summary 將圖台的坐標轉換成特定坐標系統
    * @param {ol.Coordinate|ol.Coordinate[]} coords 一個或多個圖台坐標
    * @param {string|ol.proj.Projection} targetPrj 要轉換成的坐標系統
    * @return {ol.Coordinate|ol.Coordinate[]} 轉換後的坐標
    */
    this.transCoordinateFromMapPrj = function (coords, targetPrj) {
        if (!ol.proj.Projection.prototype.isPrototypeOf(targetPrj)) {
            targetPrj = ol.proj.get(targetPrj);
        }
        srcPrj = map.getView().getProjection();

        if ($.isArray(coords[0])) {
            var ret = [];
            for (var idx = 0; idx < coords.length; idx++) {
                ret.push(this.transCoordinateToMapPrj(coords[idx], targetPrj));
            }
            return ret;
        } else {
            return ol.proj.transform(coords, srcPrj, targetPrj);
        }
    }

    /**
    * @summary 轉換bbox成地圖的坐標系統
    * @param {ol.Extent} extent bbox
    * @param {string|ol.proj.Projection} srcPrj bbox的坐標系統
    * @return {ol.Extent} 轉換後的bbox
    */
    this.transExtentToMapPrj = function (extent, srcPrj) {
        return ol.proj.transformExtent(extent, srcPrj, map.getView().getProjection());
    }

    /**
    * @summary 轉換bbox從圖台的坐標系統轉成指定的坐標系統
    * @param {ol.Extent} extent 圖台的bbox
    * @param {string|ol.proj.Projection} targetPrj 要轉換成的坐標系統
    * @return {ol.Extent} 轉換後的bbox
    */
    this.transExtentFromMapPrj = function (extent, targetPrj) {
        return ol.proj.transformExtent(extent, map.getView().getProjection(), targetPrj);
    }


    var getCoordinateHelpTipElement = null;
    var getCoordinateHelpTip = null;
    var getCoordinateTargetPrj = null;
    var getCoordinateCallback = null;
    var moveHandlerForGettingPoint = function (evt) {
        if (evt.dragging) {
            return;
        }
        if (!getCoordinateHelpTipElement) {
            getCoordinateHelpTipElement = document.createElement('div');
            getCoordinateHelpTipElement.className = 'tooltip';
            getCoordinateHelpTip = new ol.Overlay({
                element: getCoordinateHelpTipElement,
                offset: [15, 0],
                positioning: 'center-left'
            });
            getCoordinateHelpTipElement.innerHTML = getCoordinateHelpMsg;
        }
        map.addOverlay(getCoordinateHelpTip);

        var tooltipCoord = evt.coordinate;
        getCoordinateHelpTip.setPosition(evt.coordinate);
    };

    var singleClickForGettingPoint = function (evt) {
        var _callback = getCoordinateCallback;
        var _targetPrj = getCoordinateTargetPrj;

        cancelGetCoordinate();

        _callback(ol.proj.transform(evt.coordinate, map.getView().getProjection(), _targetPrj));
    };
    /**
    * @callback singleClickForGettingPoint_Callback
    * @summary 取得地圖坐標的callback
    * @param {ol.Coordinate} _coord 坐標
    */

    /**
    * @summary 啟動從圖台上取得點坐標的作業
    * @param {singleClickForGettingPoint_Callback} _callback 取得地圖坐標後的callback
    * @param {string|ol.proj.Projection} _targetPrj 取得坐標後，要轉換成的坐標系統 <br/>
    *                                    如果targetPrj未設定，則回傳 displayPrj 的坐標系統
    */
    this.getCoordinate = function (_callback, _targetPrj) {
        if (typeof _callback != "function") throw new Error("oltmx.util.Tools.getCoordinate 參數必須有callback function");
        map.on("pointermove", moveHandlerForGettingPoint);
        // 擋掉別的SingleClickEvent
        importSingleClickEventActive = true;
        me.activeLeftClickFunc(LEFT_CLICK_FUNC_PLUGIN_GET_COORDINATE);
        map.on("singleclick", singleClickForGettingPoint);
        getCoordinateCallback = _callback;
        getCoordinateTargetPrj = _targetPrj ? _targetPrj : displayPrj;
    }

    /**
    * @summary 取消從圖台上取點坐標的作業
    */
    this.cancelGetCoordinate = function () {
        getCoordinateCallback = null;
        getCoordinateTargetPrj = null;
        map.un("pointermove", moveHandlerForGettingPoint);
        // 恢復別的SingleClickEvent
        map.un("singleclick", singleClickForGettingPoint);
        me.deactiveLeftClickFunc(LEFT_CLICK_FUNC_PLUGIN_GET_COORDINATE);
        importSingleClickEventActive = false;
        map.removeOverlay(getCoordinateHelpTip);
    }
    var cancelGetCoordinate = this.cancelGetCoordinate;

    var dragBox = new ol.interaction.DragBox({
        condition: ol.events.condition.shiftKeyOnly,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'orange'
            })
        })
    });

    var selectEnd = null;
    /**
    * @summary 啟動在圖台啟動選擇一個bbox
    * @param {selectBBox_Callback}  _callback 在圖台上選擇bbox後的作業.
    * @param {string} _targetPrj 選擇bbox後，bbox坐標轉換成此坐標系統.<br />
    *                 如果未指定，則使用 displayPrj 所設定的坐標系統
    */
    this.selectBBox = function (_callback, _targetPrj) {
        me.stopSelectBBox();
        map.addInteraction(dragBox);
        selectEnd = function (e) {
            //dragBox.dispatchEvent(new ol.DragBoxEvent(ol.DragBoxEventType.BOXSTART, mapBrowserEvent.coordinate));
            var info = [];
            var extent = dragBox.getGeometry().getExtent();
            if (!_targetPrj) _targetPrj = displayPrj;
            try {
                _callback(ol.proj.transformExtent(extent, map.getView().getProjection(), _targetPrj));
            } catch (err) {
                console.log(err);
            }
        };
        dragBox.on('boxend', selectEnd);
    }
    /**
    * @callback selectBBox_Callback
    * @summary 選擇bbox後的callback
    * @param {ol.Extent} bbox 所選擇的bbox
    */

    /** 
    * @summary 停止在圖台啟動選擇一個bbox的作業
    */
    this.stopSelectBBox = function () {
        map.removeInteraction(dragBox);
        if (selectEnd) {
            dragBox.un('boxend', selectEnd);
            selectEnd = null;
        }
    }

    function createVectorLayer(layerName) {
        vectorSources[layerName] = new ol.source.Vector();
        vectorLayers[layerName] = new ol.layer.Vector({
            source: vectorSources[layerName],
            projection: "EPSG:3857",
            zIndex: layerName == "default" ? 999 : 101
        });
        map.addLayer(vectorLayers[layerName]);
    }

    this.setVectorLayerZIndex = function (layerName, zindex) {
        vectorLayers[layerName].setZIndex(zindex);
    }

    // 臨存圖層，所有臨時標註的向量圖徵，皆加入此圖層
    var vectorSource = new ol.source.Vector();
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        projection: "EPSG:3857"
    });
    // 覆蓋原icon改為1，應該由feature的style去設定透明度
    vectorLayer.setOpacity(1);
    var nextFeatureID = 0;
    map.addLayer(vectorLayer);

    map.on('singleclick', function (evt) {
        var coord = evt.coordinate;
        var tolerance = map.getView().getResolution() * 5;
        var toleranceExtent = [coord[0] - tolerance, coord[1] - tolerance, coord[0] + tolerance, coord[1] + tolerance];
        var feature = null;
        var dist = 0;
        vectorLayer.getSource().forEachFeatureIntersectingExtent(toleranceExtent, function (f) {
            var fCoord = f.getGeometry().getCoordinates();
            if (feature == null) {
                feature = f;
                closestCoord = f.getGeometry().getClosestPoint(coord);
                dist = Math.pow(fCoord[0] - coord[0], 2) + Math.pow(fCoord[1] - coord[1], 2);
            } else {
                var newDist = Math.pow(fCoord[0] - coord[0], 2) + Math.pow(fCoord[1] - coord[1], 2);
                if (newDist < dist) {
                    dist = newDist;
                    feature = f;
                }
            }
        });
        if (feature && feature.get("content") && $.trim(feature.get("content")) != "") {
            me.showBubble({ coord: evt.coordinate }, feature.get("content"));
        } else {
            me.hideBubble();
        }
    });

    /**
     * @summary 加入一個點marker到臨時圖層
     * @param {ol.Coordinate|ol.geom.Geometry|ol.Feature} coords 點坐標, 或是 ol.geom.Geometry, 或是 ol.Feature
     * @param {string} htmlContent html內容，可顯示於bubble info
     * @param {object} styleOpt ol.style.Icon的建構options，或 getStyleFromOption 的 options
     * @param {string|ol.proj.Projection} srcProj 點坐標的坐標系統
     * @param {string} layerName marker所屬圖層
     * @return {ol.Feature} 此marker的feature
     */
    this.addMarker = function (coords, htmlContent, styleOpt, srcProj, layerName) {
        var feature;
        var geom;
        if (!layerName) layerName = "default";
        if (!vectorLayers[layerName]) {
            createVectorLayer(layerName);
        }
        if (!srcProj) srcProj = displayPrj;
        if ($.isArray(coords)) {
            coords = me.transCoordinateToMapPrj(coords, srcProj);
            geom = new ol.geom.Point(coords);
        } else if (ol.geom.Geometry.prototype.isPrototypeOf(coords)) {
            // 如果是geometry
            geom = coords.clone();
            geom = geom.transform(srcProj, map.getView().getProjection());
        } else if (ol.Feature.prototype.isPrototypeOf(coords)) {
            feature = coords.clone();
            feature.setGeometry(feature.getGeometry().transform(srcProj, map.getView().getProjection()));
            feature.setId(coords.getId());
        }

        if (!feature) {
            feature = new ol.Feature({
                geometry: geom,
                content: htmlContent
            });
        }

        if (typeof (feature.getId()) == undefined) {
            feature.setId(nextFeatureIDs[layerName]++);
        }
        if (styleOpt && styleOpt.src) {
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon(styleOpt)
            }));
        } else if (styleOpt) {
            feature.setStyle(me.getStyleFromOption(styleOpt, feature));
        }
        vectorSources[layerName].addFeature(feature);
        return feature;
    }

    var emptyStyle = new ol.style.Style({});

    this.hideMarker = function (fid, layerName) {
        var source = vectorSources[layerName];
        if (!vectorFeatureOriStyle[layerName]) {
            vectorFeatureOriStyle[layerName] = {};
        }
        var oriStyleContainer = vectorFeatureOriStyle[layerName];

        var feature = source.getFeatureById(fid);
        if (feature) {
            oriStyleContainer[feature.getId()] = feature.getStyle();
            feature.setStyle(emptyStyle);
        } else {
            console.error("Marker is not exists");
        }
    };

    this.showMarker = function (fid, layerName) {
        var source = vectorSources[layerName];
        if (!vectorFeatureOriStyle[layerName]) {
            vectorFeatureOriStyle[layerName] = {};
        }
        var oriStyleContainer = vectorFeatureOriStyle[layerName];

        var feature = source.getFeatureById(fid);
        if (feature) {
            feature.setStyle(oriStyleContainer[feature.getId()]);
            delete oriStyleContainer[feature.getId()];
        } else {
            console.error("Marker is not exists");
        }
    }

    /**
    * @summary 從臨時圖層移除一個feature
    * @param {ol.Feature} feature 要移除的feature
    */
    this.removeMarker = function (feature, layerName) {
        if (!layerName) layerName = "default";
        if (vectorLayers[layerName]) {
            vectorSources[layerName].removeFeature(feature);
        }
    }

    /*
    * 由 oltmx.util.Tools.getStyleFromOption 取代
    */
    ///**
    //* @summary 利用config產生ol.style.Style
    //* @desc 可參考ol.style.Style的建構options
    //*       但為了跟ol3只有低耦合度，所以建構的options，也不須new ol3的class，<br/>
    //*       只取其所有的建構options <br/>
    //*       如，產生circle style 的 options<br/>
    //*       
    //*     {
    //*         radius: 10,
    //*         fill: {color:"#00FF00"}, // ol.style.Fill的建構options
    //*         stroke: {color:"#FF0000", width: 3} // ol.style.Storke的建構options
    //*     }
    //*       
    //* @param {object} config options for style  
    //*                        config.icon : ol.style.Icon 的建構 options  
    //*                        config.circle : ol.style.Circle 的建構 options  
    //*                        config.regularShape : ol.style.RegularShape 的建構 options  
    //*                        **icon, circle, regularShape 只可以三擇一**  
    //*                        config.fill : ol.style.Fill 的建構 options  
    //*                        config.stroke : ol.style.Stroke 的建構 options  
    //* @return {ol.style.Style} 產生的Style
    //*/
    // 
    //this.getStyleFromOption = function (config) {
    //    if (!config) {
    //        return null;
    //    }
    //    if (typeof (config) === "function") {
    //        return config;
    //    }
    //    var pointStyle = null;
    //    if (config.icon) {
    //        pointStyle = new ol.style.Icon(config.icon);
    //    }
    //    if (config.circle) {
    //        pointStyle = new ol.style.Circle(
    //            {
    //                radius: config.circle.radius,
    //                fill: new ol.style.Fill(config.circle.fill),
    //                stroke: new ol.style.Stroke(config.circle.stroke)
    //            }
    //        );
    //    }
    //    if (config.regularShape) {
    //        pointStyle = new ol.style.RegularShape(
    //            {
    //                points: config.regularShape.points,
    //                radius: config.regularShape.radius,
    //                radius1: config.regularShape.radius1,
    //                radius2: config.regularShape.radius2,
    //                angle: config.regularShape.angle,
    //                rotation: config.regularShape.rotation,
    //                fill: new ol.style.Fill(config.regularShape.fill),
    //                stroke: new ol.style.Stroke(config.regularShape.stroke)
    //            }
    //        );
    //    }
    //    return new ol.style.Style({
    //        fill: (config.fill ? new ol.style.Fill(config.fill) : null),
    //        stroke: (config.stroke ? new ol.style.Stroke(config.stroke) : null),
    //        image: pointStyle
    //    });
    //}

    /**
    * @summary 定位到臨時圖層的一個圖徵
    * @param {string|number} featureID feature ID
    */
    this.locateToFeature = function (featureID) {
        var feature = vectorSource.getFeatureById(featureID);
        if (feature == null) throw new Error("找不到此feature");
        this.locateTool.locateToFeature(feature);
        if (typeof locatingPointZoom == "number" && ol.geom.Point.prototype.isPrototypeOf(feature.getGeometry())) {
            map.getView().setZoom(locatingPointZoom);
        }
    }

    this.getAllMarker = function (layerName) {
        if (!layerName) layerName = "default";
        if (!vectorLayers[layerName]) return null;
        return vectorSources[layerName].getFeatures();
    }

    this.getMarkerById = function (fid, layerName) {
        if (!layerName) layerName = "default";
        if (!vectorLayers[layerName]) return null;
        return vectorSources[layerName].getFeatureById(fid);
    }

    this.getMarkerLayerExtent = function (layerName) {
        if (!layerName) layerName = "default";
        if (!vectorLayers[layerName]) return null;
        return vectorSources[layerName].getExtent();
    }

    /**
    * @summary 從臨時圖層取得在extent內的feature
    * @param {ol.Extent} _extent bbox
    * @param {string|ol.proj.Projection} _extentPrj bbox的坐標系統
    * @return {ol.Feature[]} 在extent內的features
    */
    this.getFeatureIntersectingExtent = function (_extent, _extentPrj) {

        var extent = _extent;
        if (extent) {
            extent = me.transExtentToMapPrj(_extent, _extentPrj);
        }
        var feature = vectorSource.forEachFeatureIntersectingExtent(extent, function (feature) { return featrue; });
        return feature;
    }

    /**
    * @summary 清除臨時圖層
    */
    this.clearFeatures = function (layerName) {
        if (!layerName) layerName = "default";
        if (!vectorLayers[layerName]) return null;

        nextFeatureIDs[layerName] = 0;
        vectorSources[layerName].clear();
    }

    /**
    * @summary 回到起始位置
    * @description 回到 initPosition所設定的起始位置，<br/>
    *              如果 initPosition是點的話，會zoom到initZoom設定的zoom level
    */
    this.backToInitPosition = function () {
        if (initPosition.length == 4) {
            var displayExtent = ol.proj.transformExtent(initPosition, displayPrj, 'EPSG:3857');
            map.getView().fit(displayExtent, map.getSize());
        } else {
            map.getView().setCenter(ol.proj.transform(initPosition, displayPrj, 'EPSG:3857'));
            map.getView().setZoom(initZoom);
        }
    }

    this.getUserPosition = function () {
        if (geolocation)
            return currentPosition;
        return null;
    }

    this.activateGeolocation = function (styleOpt) {
        var bShowPos = true;

        geolocation = new ol.Geolocation({
            projection: map.getView().getProjection(),
            tracking: true,
            trackingOptions: {
                enableHighAccuracy: true,
                maximumAge: 2000
            }
        });

        // 使用者方向樣式
        var headingStyle;

        if (styleOpt && styleOpt.headingStyle) {
            headingStyle = oltmx.util.Tools.getStyleFromOption(styleOpt.headingStyle);
        } else {
            headingStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 1.0,
                    src: 'App_Themes/map/images/locateIcon.png'
                })
            });
        }

        // 使用者方向圖徵
        var headingFeature = new ol.Feature();
        headingFeature.setStyle(headingStyle);

        // 使用者位置樣式
        var posStyle;

        if (styleOpt && styleOpt.posStyle) {
            posStyle = oltmx.util.Tools.getStyleFromOption(styleOpt.posStyle);
        } else {
            posStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#3399FF'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 3
                    })
                })
            });
        }

        // 使用者位置圖徵
        posFeature = new ol.Feature();
        posFeature.setStyle(posStyle);

        var iconSource = new ol.source.Vector({
            features: [posFeature, headingFeature]
        });
        var iconLayer = new ol.layer.Vector({
            source: iconSource
        });
        map.addLayer(iconLayer);

        geolocation.on('change', function () {
            var pos = geolocation.getPosition();
            currentPosition = pos;
            var ptPos = new ol.geom.Point(pos);
            posFeature.setGeometry(ptPos);
            var heading = geolocation.getHeading();
            // heading == null，表示瀏覽器不支援方向性
            // heading is NaN，表示尚未取得方向
            if (heading == null) {
                if (iconSource.getFeatures().indexOf(headingFeature) >= 0) iconSource.removeFeature(headingFeature);
            } else if (!isNaN(heading)) {
                if (iconSource.getFeatures().indexOf(headingFeature) < 0) iconSource.addFeature(headingFeature);
                headingFeature.getStyle.setRotation(heading);
                headingFeature.setGeometry(ptPos);
            }
        });
        return geolocation;
    }

    this.locateToUserPosition = function () {
        if (!geolocation) {
            console.error("請先啟動Geolocation， MapPlugin.activateGeolocation()");
            return;
        }
        if (currentPosition) {
            if (currentPosition) {
                map.getView().setCenter(currentPosition);
            }
        } else {
            geolocation.once('change', cbLocateToUserPosition);
        }
    }

    function cbLocateToUserPosition() {
        var pos = geolocation.getPosition();
        if (pos) {
            map.getView().setCenter(pos);
        }
    }
    /*
    * 由 oltmx.util.Tools.genContentFromFeature 取代
    */
    this.genContentFromFeature = oltmx.util.Tools.genContentFromFeature;
    //var regexTemplateVar = /(\{)([^}]+)(\})/ig;
    ///**
    //* @summary 依據template產生feature的內容
    //* @param {ol.Feature} 圖徵
    //* @param {string} 內容的template
    //* @return {string} 產生的內容
    //*/
    //this.genContentFromFeature = function (feature, templateContent) {
    //    var htmlContent = templateContent;
    //    var fieldNames = feature.getKeys();
    //    regexTemplateVar.lastIndex = 0;
    //    var searchResult;
    //    var keys = feature.getKeys();
    //    var lowerCaseKeys = [];
    //    for (var i = 0; i < keys.length; i++) {
    //        lowerCaseKeys.push(keys[i].toLowerCase());
    //    }
    //    while (true) {
    //        searchResult = regexTemplateVar.exec(htmlContent);
    //        if (!searchResult) break;
    //        try {
    //            var matchText = searchResult[2];
    //            var funcIdx = matchText.indexOf("fn:") + 3;
    //            var replaceText = null;
    //            if (funcIdx > 2) {
    //                replaceText = eval(matchText.substr(funcIdx))(feature);
    //            } else if (matchText == "$Id") {
    //                replaceText = feature.getId();
    //            } else {
    //                matchText = keys[lowerCaseKeys.indexOf(matchText.toLowerCase())];
    //                replaceText = feature.get(matchText);
    //            }
    //            if (replaceText == null) {
    //                replaceText = "";
    //            }
    //            htmlContent = htmlContent.substr(0, searchResult.index)
    //                    + (replaceText == null ? "" : replaceText)
    //                    + htmlContent.substr(searchResult.index + searchResult[0].length);
    //            regexTemplateVar.lastIndex = searchResult.index + replaceText.length;
    //        } catch (e) {
    //            regexTemplateVar.lastIndex = searchResult.index + searchResult[0].length;
    //        }
    //    }
    //    return htmlContent;
    //}

    /**
    * @summary zoom out 一個level
    */
    this.zoomOut = function () {
        if (map.getView().getZoom() == 0) return;
        map.getView().setZoom(map.getView().getZoom() - 1);
    }

    /**
    * @summary zoom in 一個level
    */
    this.zoomIn = function () {
        if (map.getView().getZoom() == maxZoomLevel) return;
        map.getView().setZoom(map.getView().getZoom() + 1);
    }

    /**
    * @summary zoom 到指定的level
    * @zoomLevel {int} 指定的 zoom level
    */
    this.setZoom = function (zoomLevel) {
        map.getView().setZoom(zoomLevel);
    }

    /**
    * @summary 加入map事件，參考ol.Map的on method
    */
    this.on = function () {
        var args = $.makeArray(arguments);
        args[2] = map;
        map.on.apply(map, args);
    };
    /**
    * @summary 加入map一次性事件，參考ol.Map的once method
    */
    this.once = function () {
        var args = $.makeArray(arguments);
        args[2] = map;
        map.once.apply(map, args);
    };
    /**
    * @summary 取消map事件，參考ol.Map的un method
    */
    this.un = function () {
        var args = $.makeArray(arguments);
        args[2] = map;
        map.un.apply(map, args);
    };

    /**
    * @summary 允許Plugin使用長度測量功能
    * @protected
    */
    this.activeMeasureLengthTool = function () {
        me.measureLengthTool = new oltmx.measure.MeasureLength(me, options);
    }
    /**
    * @summary 允許Plugin使用面積測量功能
    * @protected
    */
    this.activeMeasureAreaTool = function () {
        me.measureAreaTool = new oltmx.measure.MeasureArea(me, options);
    }
    /**
    * @summary 允許Plugin使用定位功能
    * @protected
    */
    this.activeLocateTool = function () {
        me.locateTool = new oltmx.util.Locate(me, options);
    }
    /**
    * @typedef {{mapLayers:Object}} activeLayersMgToolOption
    * @property {Object} mapLayers - 圖層設定
    */
    /**
    * @summary 允許Plugin使用圖層管理功能
    * @param {activeLayersMgToolOption} activeOptions - options
    * @protected
    */
    this.activeLayersMgTool = function (activeOptions) {
        me.layersMg = new oltmx.LayersManager(me, activeOptions.mapLayers, options);
    }
    /**
    * @summary 允許Plugin使用編輯功能
    * @protected
    */
    this.activeEditorTool = function () {
        me.editorTool = new oltmx.editor.Editor(me, options);
    }

    var leftClickFuncStack = [];
    /**
    * @summary
    * 加入指定的左鍵點選對應功能
    * @param {string} funcID
    * @protected
    */
    this.activeLeftClickFunc = function (funcID) {
        this.deactiveLeftClickFunc(funcID);
        leftClickFuncStack.push(funcID);
    }
    /**
    * @summary 移除特定左鍵點選對應功能
    * @param {string} funcID
    * @protected
    */
    this.deactiveLeftClickFunc = function (funcID) {
        var idx = leftClickFuncStack.indexOf(funcID);
        if (idx >= 0) {
            delete leftClickFuncStack[idx];
            leftClickFuncStack = leftClickFuncStack.slice(0, idx).concat(leftClickFuncStack.slice(idx + 1, leftClickFuncStack.length));
        }
    }
    /**
    * @summary 取得目前左鍵點選對應功能
    * @desc 當圖台同時有不同的左鍵Event需要觸發，可讓左鍵事件判斷，現在是否屬於該功能需要啟動
    * @protected
    */
    this.currentLeftClickFunc = function () {
        return leftClickFuncStack[leftClickFuncStack.length - 1];
    }

    /**
    * @summary 啟動特定tool
    * @desc
    *  啟動的function name必須存在 "active" + toolID  
    *  如 toolID = "MeasureLengthTool"， 
    *  則會透過function activeMeasureLengthTool()來啟動長度測量功能  
    * @param {string} toolID 
    *                 Plugin 必須存function名稱為 active+`toolID`
    * @param {Object} params
    *                 呼叫active+`toolID`時，需要給的參數
    * @return {string} 如果發生錯誤時，會回傳訊息；如果成功，則回傳空字串
    */
    this.active = function (toolID, params) {
        var errMsg = "";
        if (eval("this.active" + toolID + "Tool")) {
            if (activedTools.indexOf(toolID) < 0) {
                eval("this.active" + toolID + "Tool")(params);
                activedTools.push(toolID);
            }
        } else {
            errMsg += "不支援[" + toolID + "]的功能";
        }
        return errMsg;
    }

    // constructor
    {
        if (options) {
            if (options.actives) {
                var errMsg = "";
                for (var i = 0; i < options.actives.length; i++) {
                    errMsg += (errMsg == "" ? "" : "\n")
                        + this.active(options.actives[i].id, options.actives[i].params);
                }
                if (errMsg != "") alert(errMsg);
            }
        }
    }


}

/**
* @summary 取得圖台的坐標系統
* @return {ol.proj.Projection}
*/
oltmx.Plugin.prototype.getMapProj = function () {
    return this.getMap().getView().getProjection();
}

/**
* @summary 地圖畫面截圖
* @desc 需要web service配合  
*       web service網址設定於變數 htmlCaptureService
* @param {float}  startCoord  The start coordinate.
* @param {int}  imgSize     Size of the image.
* @param {string}  imgFormat   The image format. png/jpg
* @param {object} param [Optional]發出request使用的額外參數
* @param {...captureMap_Callback}  _callback   The callback.
*/
oltmx.Plugin.prototype.captureMap = function (startCoord, imgSize, imgFormat) {
    var theMap = this.getMap();
    var params = null;
    var _callback = null;
    if (typeof (arguments[3]) == "function") {
        _callback = arguments[3];
    } else {
        params = arguments[3]
        _callback = arguments[4];
    }
    if (!htmlCaptureService) {
        throw new Error("未設定 capture service 的位址於變數 htmlCaptureService");
    }
    var mapSize = theMap.getSize();
    var mapExtent = this.get2DExtent();
    var canvasData = {};
    var canvases = $(theMap.getViewport()).find("canvas");
    for (var idx = 0; idx < canvases.length; idx++) {
        canvasData[idx] = canvases[idx + ""].toDataURL();
    }

    var reqData = {
        content: theMap.getViewport().outerHTML,
        format: imgFormat,
        fullwidth: mapSize[0],
        fullHeight: mapSize[1],
        imgWidth: imgSize[0],
        imgHeight: imgSize[1],
        startX: Math.round(startCoord[0]),
        startY: Math.round(startCoord[1]),
        baseUri: location.toString(),
        minX: mapExtent[0],
        minY: mapExtent[1],
        maxX: mapExtent[2],
        maxY: mapExtent[3],
        rotation: 180 * (map.getView().getRotation() / Math.PI),
        canvasData: canvasData
    };
    if (params && typeof (params) == "object") {
        for (var key in params) {
            reqData[key] = params[key];
        }
    }
    $.ajax({
        url: htmlCaptureService,
        method: "POST",
        data: reqData,
        success: _callback,
        error: _callback
    });
}

oltmx.Plugin.prototype.captureMap2 = function (startCoord, imgSize, imgFormat) {
    var theMap = this.getMap();
    var mapSize = theMap.getSize();
    var mapExtent = this.get2DExtent();
    var canvasData = {};
    var canvases = $(theMap.getViewport()).find("canvas");
    for (var idx = 0; idx < canvases.length; idx++) {
        canvasData[idx] = canvases[idx + ""].toDataURL();
    }
    var reqData = {
        content: theMap.getViewport().outerHTML,
        format: imgFormat,
        fullwidth: mapSize[0],
        fullHeight: mapSize[1],
        imgWidth: imgSize[0],
        imgHeight: imgSize[1],
        startX: Math.round(startCoord[0]),
        startY: Math.round(startCoord[1]),
        baseUri: location.toString(),
        minX: mapExtent[0],
        minY: mapExtent[1],
        maxX: mapExtent[2],
        maxY: mapExtent[3],
        rotation: 180 * (map.getView().getRotation() / Math.PI),
        canvasData: canvasData
    };

    var ctx = canvases[0].getContext("2d");
    var imgData = ctx.getImageData(reqData.startX, reqData.startY, reqData.imgWidth, reqData.imgHeight);
    //return img;
}
/**
* 截圖產製完成後的callbck
* @callback captureMap_Callback
* @param {CaptureMapResult} _data 截圖產生service回傳的資料，內含影像連結
*/
/**
* 截圖web service回傳資訊
* @typedef {{imageURL:(string)}} CaptureMapResult
* @property {string} imageURL 截圖的影像連結
*/

/**
* @summary 以圖台中心取指定大小的截圖
* @param {ol.Size} imgSize 指定截圖大小
* @param {string} imgFormat 截圖影像格式png/jpg等
* @param {captureMap_Callback} _callback 截圖產製完成後，呼叫此function
*/
oltmx.Plugin.prototype.captureMapCenter = function (imgSize, imgFormat) {
    var theMap = this.getMap();
    if (!htmlCaptureService) {
        throw new Error("未設定 capture service 的位址於變數 htmlCaptureService");
    }
    var mapSize = theMap.getSize();
    var startPixel = [(mapSize[0] - imgSize[0]) / 2, (mapSize[1] - imgSize[1]) / 2];
    //var startCoord = theMap.getCoordinateFromPixel(startPixel);
    var params = null;
    var _callback = null;
    if (typeof (arguments[2]) == "function") {
        _callback = arguments[2];
        params = arguments[1];
    } else {
        params = arguments[2]
        _callback = arguments[3];
    }
    this.captureMap(startPixel, imgSize, imgFormat, params, _callback);
}

oltmx.Plugin.prototype.captureMapCenter2 = function (imgSize, imgFormat) {
    var theMap = this.getMap();
    var mapSize = theMap.getSize();
    var startPixel = [(mapSize[0] - imgSize[0]) / 2, (mapSize[1] - imgSize[1]) / 2];
    this.captureMap2(startPixel, imgSize, imgFormat);
}
/**
* @summary 取得圖台2D的bbox
* @return {ol.Extent} bbox
*/
oltmx.Plugin.prototype.get2DExtent = function () {
    var theMap = this.getMap();
    return theMap.getView().calculateExtent(theMap.getSize());
}

/**
* @summary 在圖台上顯示一個bubble info
* @param {entity.CoordInfo}
*/
oltmx.Plugin.prototype.showBubble = function (coordInfo, htmlContent) {
    var coord = coordInfo.coord;
    if (coordInfo.proj) {
        coord = ol.proj.transform(coord, coordInfo.proj, "EPSG:3857");
    }
    oltmx.Bubble.show(this.getMap(), coord, htmlContent);
}

/**
* @summary 隱藏圖台上的bubble info
*/
oltmx.Plugin.prototype.hideBubble = function () {
    oltmx.Bubble.hide(this.getMap());
}

/**
* @summary 利用config產生ol.style.Style
* @desc 可參考ol.style.Style的建構options
*       但為了跟ol3只有低耦合度，所以建構的options，也不須new ol3的class，<br/>
*       只取其所有的建構options <br/>
*       如，產生circle style 的 options<br/>
*       
*     {
*         radius: 10,
*         fill: {color:"#00FF00"}, // ol.style.Fill的建構options
*         stroke: {color:"#FF0000", width: 3} // ol.style.Storke的建構options
*     }
*       
* @param {object} config options for style  
*                        config.icon : ol.style.Icon 的建構 options  
*                        config.circle : ol.style.Circle 的建構 options  
*                        config.regularShape : ol.style.RegularShape 的建構 options  
*                        **icon, circle, regularShape 只可以三擇一**  
*                        config.fill : ol.style.Fill 的建構 options  
*                        config.stroke : ol.style.Stroke 的建構 options  
* @return {ol.style.Style} 產生的Style
*/
oltmx.Plugin.prototype.getStyleFromOption = oltmx.util.Tools.getStyleFromOption

/**
* @summary 啟用畫圖徵之功能ol.interaction.Draw
* @desc 依照不同的圖徵型態繪製圖徵
* @param {object} 圖徵型態   
*                 drawType : ol.interaction.Draw畫圖徵得型態(點、線、面)                       
*/
oltmx.Plugin.prototype.drawFeature = function (drawType) {
    drawInteraction = new ol.interaction.Draw({
        source: drawSource,
        type: drawType
    });
    map.addInteraction(drawInteraction);
}

/*
* @summary 啟用修改圖徵功能
* @desc 於標註清單點選欲編輯的圖徵，並進行編輯
* @param {object} 指定的圖徵
*/
oltmx.Plugin.prototype.modifyFeature = function (feature) {
    map.removeInteraction(drawInteraction);
    map.removeInteraction(modifyInteraction);
    var modifyCollection = new ol.Collection();

    if (feature.getGeometry().getType() != "Point") {
        modifyCollection.push(feature);
    }

    modifyInteraction = new ol.interaction.Modify({
        features: modifyCollection
    });

    map.addInteraction(modifyInteraction);
}

/**
* @summary 設定點圖徵樣式
* @return {ol.style.Style} 產生的點圖徵樣式
*/
oltmx.Plugin.prototype.setPointMarkStyle = function (pointColor, pointScale, pointTxt, feature) {
    var pointStyleConfig = {
        text: {
            text: pointTxt,
            fill: {
                color: '#000000'
            },
            stroke: {
                width: 4,
                color: '#FFFFFF'
            },
            font: "12pt 微軟正黑體",
            offsetY: 25
        },
        circle: {
            radius: pointScale * 6,
            fill: {
                color: pointColor
            },
            stroke: {
                color: pointColor
            }
        }
    };
    return oltmx.util.Tools.getStyleFromOption(pointStyleConfig, feature);
}

/**
* @summary 設定線圖徵樣式
* @return {ol.style.Style} 產生的線圖徵樣式
*/
oltmx.Plugin.prototype.setLineMarkStyle = function (lineColor, lineWidth, lineTxt, feature) {
    var lineStyleConfig = {
        text: {
            text: lineTxt,
            fill: {
                color: '#000000'
            },
            stroke: {
                width: 4,
                color: '#FFFFFF'
            },
            font: "12pt 微軟正黑體",
            offsetY: 20
        },
        stroke: {
            color: lineColor,
            width: parseInt(lineWidth),
            lineDash: [1, 0]
        }
    };
    return oltmx.util.Tools.getStyleFromOption(lineStyleConfig, feature);
}

/**
* @summary 設定面圖徵樣式
* @return {ol.style.Style} 產生的面圖徵樣式
*/
oltmx.Plugin.prototype.setPolyMarkStyle = function (polyFillColor, polyStrokeColor, polyWidth, polyTxt, feature) {
    var polyStyleConfig = {
        text: {
            text: polyTxt,
            fill: {
                color: '#000000'
            },
            stroke: {
                width: 4,
                color: '#FFFFFF'
            },
            font: "12pt 微軟正黑體",
            offsetY: 0
        },
        fill: {
            color: polyFillColor
        },
        stroke: {
            color: polyStrokeColor,
            width: parseInt(polyWidth),
            lineDash: [1, 0]
        }
    };
    return oltmx.util.Tools.getStyleFromOption(polyStyleConfig, feature);
}

/**
* @summary 設定文字圖徵樣式
* @return {ol.style.Style} 產生的文字圖徵樣式
*/
oltmx.Plugin.prototype.setTextMarkStyle = function (Text, textFillColor, textWidth, textStrokeColor, textScale, feature) {
    var textStyleConfig = {
        text: {
            text: Text,
            fill: {
                color: textFillColor
            },
            stroke: {
                width: parseInt(textWidth),
                color: textStrokeColor
            },
            font: textScale + "pt 微軟正黑體",
            offsetY: 0
        },
        icon: {
            src: 'images/map_legend/empty.png',
            opacity: 0
        }
    }
    return oltmx.util.Tools.getStyleFromOption(textStyleConfig, feature);
}

/*
* @summary 設定鷹眼地圖
* @param {object} position for overviewmap  
*                        divBottom : 鷹眼圖底部位置 
*                        divLeft : 鷹眼圖靠左位置  
*                        divRight : 鷹眼圖靠右位置   
*                        layer : 鷹眼圖底圖
*                        elementOVMap : 鷹眼圖底圖的Element
*/
oltmx.Plugin.prototype.setOverviewMap = function (divBottom, divTop, divLeft, divRight, layer, elementOVMap) {
    map.removeControl(overviewMapControl);
    if (layer != null) {
        overviewMapControl = new ol.control.OverviewMap({
            className: 'ol-overviewmap',
            layers: [layer],
            target: elementOVMap,
            collapsible: true,
            collapsed: false
        });
        map.addControl(overviewMapControl);

        elementOVMap.style.bottom = divBottom;
        elementOVMap.style.top = divTop;
        elementOVMap.style.left = divLeft;
        elementOVMap.style.right = divRight;
    }
}

/*
* @summary 將圖徵匯出KML字串
* @param {object} Features Array
*                 Features : ex [ol.Feature, ol.Feature]
* @return {KML String} <kml xmlnx="">...</kml>
*/
oltmx.Plugin.prototype.export2KML = function (Features) {
    var kmlFormat = new ol.format.KML();
    var kmlString = kmlFormat.writeFeatures(Features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    return kmlString;
}

/**
* @summary 坐標系統工具
* @class
*/
oltmx.util.Proj = {};

/**
* @summary 計算`sourceProj`的resolution
* @param {ol.proj.ProjectionLike} sourceProj 要轉換成此坐標系統的resolution
* @param {ol.proj.ProjectionLike} sourceProj 要從此坐標系統的resolution轉換
* @param {ol.Coordinate} targetCenter 要轉換的坐標
* @param {float} targetResolution 要轉換的resolution
* @return {float} 轉換後的resolution
* @static
* @note copy from ol.reproj.calculateSourceResolution(ol-debug.js)
*/

oltmx.util.Proj.calculateSourceResolution =
    function (sourceProj, targetProj, targetCenter, targetResolution) {
        sourceProj = ol.proj.get(sourceProj);
        targetProj = ol.proj.get(targetProj);
        var sourceCenter = ol.proj.transform(targetCenter, targetProj, sourceProj);

        // calculate the ideal resolution of the source data
        //var sourceResolution = targetProj.getPointResolution(targetResolution, targetCenter);
        var sourceResolution = ol.proj.getPointResolution(targetProj, targetResolution, targetCenter);

        var targetMetersPerUnit = targetProj.getMetersPerUnit();
        if (targetMetersPerUnit !== undefined) {
            sourceResolution *= targetMetersPerUnit;
        }
        var sourceMetersPerUnit = sourceProj.getMetersPerUnit();
        if (sourceMetersPerUnit !== undefined) {
            sourceResolution /= sourceMetersPerUnit;
        }

        // Based on the projection properties, the point resolution at the specified
        // coordinates may be slightly different. We need to reverse-compensate this
        // in order to achieve optimal results.

        //var compensationFactor = sourceProj.getPointResolution(sourceResolution, sourceCenter) / sourceResolution;

        var compensationFactor = ol.proj.getPointResolution(sourceProj, sourceResolution, sourceCenter) / sourceResolution;

        if (isFinite(compensationFactor) && compensationFactor > 0) {
            sourceResolution /= compensationFactor;
        }

        return sourceResolution;
    };

/**
* Tool for Bubble Info
* @class
* @protected
*/
oltmx.Bubble = {};
oltmx.Bubble.__currentBubble = {};

// 參數1:popup dom id
// 參數2:popup 參數
/**
* @summary 取得特定的bubble info overlay
* @desc 一個bubble info係 ol.Overlay  
*       此function參數的options  
*       為`ol.Overlay`的建構options  
*       但可以加上domID這個property，表示bubbleInfo的ID
* @param {string|Object} arg1 
*                        如果是string，則為bubble info的ID；  
*                        如果是object, 則為options
* @param {Object} arg2 
*                 如果`arg1`為id，  
*                 則此參數必為options
* @return {ol.Overlay} 代表指定的bubble info overlay
* @protected
*/
oltmx.Bubble.get =
    function () {
        var options;
        var bubbleName = "_default_bubble_";
        if (arguments.length > 0) {
            if (typeof arguments[0] == "string") {
                bubbleName = arguments[0];
            } else if (typeof arguments[0] == "object") {
                options = arguments[0];
                if (options.domID) {
                    bubbleName = options.domID;
                }
            }
        }
        if (oltmx.Bubble.__currentBubble[bubbleName]) {
            return oltmx.Bubble.__currentBubble[bubbleName];
        }
        var $bubbleElement = $("#" + bubbleName);
        if (options && options.element) {
            $bubbleElement = $(options.element);
        }
        if ($bubbleElement.length == 0) {
            $bubbleElement = $(defaultBubbleContainerHTML);
            $bubbleElement.attr("id", bubbleName);
        }
        bubbleElement = $bubbleElement[0];
        if (options == null && arguments.length > 1) {
            options = arguments[1];
            if (!options.element) {
                options.element = bubbleElement;
            }
        } else {
            options = {
                element: bubbleElement,
                autoPan: true,
                autoPanAnimation: {
                    duration: 100
                },
                offset: [0, 34]
            };
        }

        var bubbleOverlay = new ol.Overlay(options);
        $bubbleElement.find(".close").attr("onclick", "oltmx.Bubble.get('" + bubbleName + "').setMap(null);");
        oltmx.Bubble.__currentBubble[bubbleName] = bubbleOverlay;
        return bubbleOverlay;
    }

/**
* @summary 顯示bubble info
* @desc 在`map`上的`coord`位置顯示bubble info，  
*       其內容填入html格式的內容`htmlContent`
* @param {ol.Map} 圖台
* @param {ol.Coordinate} coord 圖台坐標系統的坐標
* @param {string} htmlContent html格式的內容
* @protected
*/
oltmx.Bubble.show = function (map, coord, htmlContent) {
    var overLay = oltmx.Bubble.get();
    overLay.setMap(map);
    var $olayElement = $(overLay.getElement());
    $olayElement.find(".MapBubbleStyle").html(htmlContent);
    overLay.setPosition(coord);
};

/**
* @summary 隱藏圖台上的bubble info
* @param {ol.Map} map 圖台
* @protected
*/
oltmx.Bubble.hide = function (map) {
    oltmx.Bubble.get().setMap(null);
}

/**
* @namespace
* @summary 資料格式相關
* @protected
*/
oltmx.format = {};
/**
* @class
* @summary gml格式相關
* @protected
*/
oltmx.format.gml = {};
/**
* @function
* @summary 將GML轉換成ol.Feature[]
* @return {ol.Feature[]}
* @protected
*/
oltmx.format.gml.readFeatures = function (_gmlContent, _targetPrj) {
    var gmlContent = _gmlContent;
    var targetPrj = "EPSG:3857";

    if (typeof (gmlContent) == "string") {
        gmlContent = new DOMParser().parseFromString(_gmlContent, "text/xml");
    }

    if (_targetPrj) {
        targetPrj = _targetPrj;
    }
    if (!gmlContent) return null;
    var gmlFormat = null;
    var gmlNS = null;
    for (var i = 0; i < gmlContent.documentElement.attributes.length; i++) {
        if (gmlContent.documentElement.attributes[i].nodeValue == "http://www.opengis.net/gml") {
            gmlNS = gmlContent.documentElement.attributes[i].nodeValue;
            break;
        }
    }
    if (!gmlNS) {
        alert("抱歉，本系統僅支援GML3.1.1與GML2.1.2");
        return null;
    }
    var $position = $(gmlContent).find("coordinates:first");
    var srsName = $(gmlContent).find("*[srsName]:first").attr("srsName");
    if ($position.length > 0) {
        gmlFormat = new ol.format.GML2({
            srsName: srsName
        });
    } else {
        gmlFormat = new ol.format.GML3({
            srsName: srsName
        });
    }
    return gmlFormat.readFeatures(gmlContent, {
        dataProjection: srsName,
        featureProjection: "EPSG:3857"
    });
}