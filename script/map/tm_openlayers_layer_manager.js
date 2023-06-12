/**
* 圖層管理工具  
* @class
*  
* layer.getVisible() == true, 且在map.getLayers()里，則表layer需開啟且可顯示  
* layer.getVisible() == true, 且不在map.getLayers()里，則表layer需開啟且不可顯示  
* layer.getVisible() == false, 則表layer未開啟  
* @constructor
* @param {oltmx.Plugin} _mapPlugin - TMD Map Plugin
* @param {LayerGroup} _layersInfo - 完整圖資設定Object
*/
oltmx.LayersManager = function (_mapPlugin, _layersInfo, mapOptions) {
    var mapOptions = mapOptions;
    var LEFT_CLICK_FUNC_LAYERS_MANAGER_IDENTIFY = "layers_manager_identify";
    var layersInfo = _layersInfo;
    var plugin = _mapPlugin;
    var map = plugin.getMap();
    var me = this;
    var identifyFinishEvent;
    var identifyStartEvent;
    var identifyDeferred = [];
    var pixelFeatures = {};

    // 圖層 instance
    // 只有在LayerInfo被remove時，new過的instance才會被移除
    var layersInstance = {};

    function initLayerInfo(nodes, parentNode) {
        for (key in nodes) {
            var subNode = nodes[key];
            if (!subNode) continue;
            subNode.layerID = (parentNode ? parentNode.layerID + "/" : "") + key;
            initLayerInfo(subNode.sub, subNode);
        }
    }

    initLayerInfo(_layersInfo);

    // 重設所有圖層是否可顯示
    function resetLayersShowup() {
        for (var layerID in layersInstance) {
            resetLayerShowup(layerID);
        }
    }

    map.getView().on('change:resolution', resetLayersShowup);
    // 重設圖層是否可顯示
    function resetLayerShowup(layerInfoOrID) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var layer = me.getLayer(layerInfo);
        if (!layer.getVisible()) {
            return;
        }
        var layerGroup = me.getLayerGroup(layerInfo);
        var visible = me.getLayerShowup(layerInfo);
        var mapLayers = layerGroup.getLayers().getArray();
        if (visible) {
            if (mapLayers.indexOf(layer) < 0)
                layerGroup.getLayers().push(layer);
        } else {
            if (mapLayers.indexOf(layer) >= 0)
                layerGroup.getLayers().remove(layer);
        }
    }

    /** 
    * @summary 圖層是否可顯示
    * @param {LayerInfoOrID} layerInfoOrID - 判斷的圖層
    * @return {boolean} 是否可顯示
    */
    this.getLayerShowup = function (layerInfoOrID) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var mapView = map.getView();
        var visible = true;
        visible &= typeof (layerInfo.minLevel) == "undefined" || mapView.getZoom() >= layerInfo.minLevel;
        visible &= typeof (layerInfo.maxLevel) == "undefined" || mapView.getZoom() <= layerInfo.maxLevel;
        return visible;
    };

    /**
    * @summary 依照圖層設定的geometryType取得圖層所屬的ol.layer.Group
    * @param {LayerInfoOrID} layerInfoOrID - 指定的圖層
    * @return {ol.layer.Group} 圖層群組
    */
    this.getLayerGroup = function (layerInfoOrID) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var layerGroup = plugin.getUnknowTypeGroup();
        if (layerInfo.geometryType) {
            var tmp = plugin.getLayerGroup(layerInfo.geometryType.toLowerCase());
            if (tmp) layerGroup = tmp;
        }
        return layerGroup;
    };

    /**
    * @summary 轉變圖層開關狀態
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {boolean=} isTurnOn - 強制設定該圖層開關  
    *                   true : 開  
    *                   false : 關
    */
    this.switchTheLayer = function (layerInfoOrID, isTurnOn) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        if (layerInfo) {
            if (layerInfo.type == "folder") {
                if (typeof (isTurnOn) == "undefined") {
                    layerInfo.visible = !layerInfo.visible;
                } else {
                    layerInfo.visible = isTurnOn;
                }
                for (key in layerInfo.sub) {
                    if (layerInfo.sub[key]) {
                        me.switchTheLayer(layerInfo.sub[key].layerID, layerInfo.visible);
                    }
                }
                return layerInfo.visible;
            } else {
                var serviceInfo = layerInfo.serviceInfo;
                var layerGroup = me.getLayerGroup(layerInfo);
                var layer = me.getLayer(layerInfo);
                if (layer) {
                    var isVisible = false;
                    if (typeof (isTurnOn) == "undefined") {
                        isVisible = !layer.getVisible();
                    } else {
                        isVisible = isTurnOn;
                    }
                    if (isVisible) {
                        if (!layer.getVisible()) {
                            layerGroup.getLayers().push(layer);
                            layer.setVisible(true);
                            if (layerInfo.onAdd) {
                                layerInfo.onAdd();
                            }
                        }
                    } else {
                        if (layer.getVisible()) {
                            layerGroup.getLayers().remove(layer);
                            layer.setVisible(false);
                            if (layerInfo.onRemove) {
                                layerInfo.onRemove();
                            }
                        }
                    }
                } else {
                    if(typeof (isTurnOn) == "undefined" || isTurnOn) {
                        layer = me.addLayer(layerInfo);
                        if (layerInfo.onInit) {
                            layerInfo.onInit();
                        }
                        if(layerInfo.onAdd){
                            layerInfo.onAdd();
                        }
                    } else {
                        return false;
                    }

                }
                resetLayerShowup(layerInfo);
                return layer.getVisible();
            }
        } else {
            alert("圖層不存在");
        }
    }

    /**
    * @summary 轉變底圖開關狀態
    * @param {mapInfo} mapInfo - 底圖資訊
    * @param {boolean=} isTurnOn - 強制設定該底圖開關  
    *                   true : 開  
    *                   false : 關
    */
    this.switchTheMap = function (mapInfo, isTurnOn) {
        mapPlugin.getBaseLayerGroup().getLayers().forEach(function (BaseLayer) {
            mapPlugin.getBaseLayerGroup().getLayers().remove(BaseLayer);
        });

        if (isTurnOn) {
            var baseMapInfo = mapInfo.serviceInfo;
            if (baseMapInfo.type == "WMTS") {
                var parser = new ol.format.WMTSCapabilities();
                $.ajax('service/proxy.ashx?url=' + encodeURIComponent(baseMapInfo.url)).then(function (response) {
                    var result = parser.read(response);
                    var options = ol.source.WMTS.optionsFromCapabilities(result,
                        { layer: baseMapInfo.layer, matrixSet: baseMapInfo.matrixSet, requestEncoding: baseMapInfo.requestEncoding });

                    var serviceInfo = {
                        result: result,
                        format: options.format,
                        targetPrj: options.projection,
                        matrixSet: options.matrixSet,
                        tileGrid: options.tileGrid,
                        useProxy: true,
                        url: baseMapInfo.url,
                        params: {
                            layer: options.layer,
                        }
                    }

                    layer = genWMTSLayer(serviceInfo);

                    baseLayerInfos[baseMapInfo.name] = {
                        display: false,
                        layer: layer
                    }

                    switchBaseLayer(baseMapInfo.name);
                });
            } else if (baseMapInfo.type == "XYZ") {
                layer = new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: baseMapInfo.url,
                        tileLoadFunction: baseMapInfo.useProxy ?
                            function (imageTile, src) {
                                imageTile.getImage().src = "service/proxy.ashx?url=" + encodeURIComponent(src);
                            } : undefined
                    })
                });

                baseLayerInfos[baseMapInfo.name] = {
                    display: false,
                    layer: layer
                }

                switchBaseLayer(baseMapInfo.name);
            }
        }
    }

    /**
   * @summary 轉變鷹眼圖開關狀態
   * @param {mapInfo} mapInfo - 鷹眼圖資訊
   * @param {boolean=} isTurnOn - 強制設定該底圖開關  
   *                   true : 開  
   *                   false : 關
   * @param {elementOVMap} elementOVMap - 鷹眼圖HTML物件
   */
    this.switchTheOverviewMap = function (mapInfo, isTurnOn, elementOVMap) {
        if (isTurnOn) {
            var overviewMapInfo = mapInfo.serviceInfo;
            if (overviewMapInfo.type == "WMTS") {
                var parser = new ol.format.WMTSCapabilities();
                $.ajax('service/proxy.ashx?url=' + encodeURIComponent(overviewMapInfo.url)).then(function (response) {
                    var result = parser.read(response);
                    var options = ol.source.WMTS.optionsFromCapabilities(result,
                        { layer: overviewMapInfo.layer, matrixSet: overviewMapInfo.matrixSet, requestEncoding: overviewMapInfo.requestEncoding });

                    var serviceInfo = {
                        result: result,
                        format: options.format,
                        targetPrj: options.projection,
                        matrixSet: options.matrixSet,
                        tileGrid: options.tileGrid,
                        useProxy: true,
                        url: overviewMapInfo.url,
                        params: {
                            layer: options.layer,
                        }
                    }

                    layer = genWMTSLayer(serviceInfo);
                    oltmx.Plugin.prototype.setOverviewMap("5em", "", "0px", "", layer, elementOVMap);
                });
            }
        }
    }

    // 取得layerID /*，如果沒有layerID亂數給一個值*/
    var getLayerID = this.getLayerID = function (layerInfo) {
        var layerID = layerInfo.layerID;
        //if (!layerID) {
        //    layerID = Math.floor(Math.random() * 1000000);
        //    layerInfo.layerID = layerID;
        //}
        return layerID;
    }

    /**
    * @summary 加入圖層資訊
    * @param {String} parentID - 要加入的圖層群組ID
    * @param {String} key - Layer識別值，必須在group中是唯一值
    * @param {LyaerInfo} layerInfo - 該圖層的設定Object
    * @return 加入圖層的LayerID
    */
    this.addLayerInfo = function (parentID, key, layerInfo) {
        if (me.getLayerInfo(parentID) == undefined) {
            if (map_layers['其他'] == undefined) {
                map_layers['其他'] = {
                    name: "其他",
                    type: "folder",
                    sub: {}
                }
            }
        }
        var group = me.getLayerInfo(parentID).sub;
        if (group[key]) {
            throw new Error(parentID + "的sub已經已經存在這個key['" + key + "']，換一個新key值");
        }
        layerInfo.layerID = parentID + "/" + key;
        group[key] = layerInfo;
        if (layerInfo.sub) {
            initLayerInfo(layersInfo);
        }
        return layerInfo.layerID;
    };

    /**
    * @summary 移除圖層與圖層資訊
    * @param {LayerInfoOrID} layerInfoOrID - 要移除的圖層
    * @return {LayerInfo} 移除的圖層設定Object
    */
    this.removeLayerInfo = function (layerInfoOrID) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        if (!layerInfo) return;
        me.switchTheLayer(layerInfoOrID, false);
        delete layersInstance[getLayerKey(layerInfo)];
        var parentInfo = me.getParentInfo(layerInfo);
        var path = layerInfo.layerID.split('/');
        delete parentInfo.sub[path[path.length - 1]];
        // 回傳前，應該先移除其多餘的資訊，如layerID等
        return layerInfo;
    };

    /**
    * @summary 加入一個WMS endpoint
    * @param {string} parnetID - 要加入的指定群組
    * @param {string} sourceURL - WMS endpoint URL
    * @param {function} _callback - 此WMS endpoint的圖層資訊加入後，呼叫此function
    */
    this.addWMSSource = function (parentID, sourceURL, _callback) {
        var wmsReqURL = null;
        if (sourceURL.indexOf("?") > -1) {
            wmsReqURL = sourceURL + "&service=wms&request=GetCapabilities"
        } else {
            wmsReqURL = sourceURL + "?service=wms&request=GetCapabilities"
        }
        // 利用proxy去讀取，才不會有cross domain的issue
        $.ajax("service/proxy.ashx?url=" + encodeURIComponent(wmsReqURL))
            .then(function (resp) {
                var parser = new ol.format.WMSCapabilities();
                var result = parser.read(resp);
                if (result.Capability && result.Capability.Layer) {
                    var baseLayer = result.Capability.Layer;
                    var layerInfo = {
                        sub: {}
                    };
                    genWMSLayerInfo(layerInfo, baseLayer, sourceURL, result.version);
                    for (var key in layerInfo.sub) {
                        layerInfo = layerInfo.sub[key];
                        break;
                    }
                    me.addLayerInfo(parentID, new Date().getTime().toString(), layerInfo);
                    if (_callback) {
                        _callback();
                    }
                }
            });
    };

    function genWMSLayerInfo(parentObject, layer, sourceURL, version) {
        var key = (new Date().getTime() + "_").substr(9) + Math.round(Math.random() * 100000000);
        if (layer.Layer) {
            var layerInfo = {
                name: layer.Title,
                type: "folder",
                sub: {}
            };
            parentObject.sub[key] = layerInfo;
            if ($.isArray(layer.Layer)) {
                for (var i = 0; i < layer.Layer.length; i++) {
                    genWMSLayerInfo(layerInfo, layer.Layer[i], sourceURL, version);
                }
            } else {
                genWMSLayerInfo(layerInfo, layer.Layer, sourceURL, version);
            }
        } else {
            var layerInfo = {
                name: layer.Title,
                type: "node"
            };
            if (layer.Style && $.isArray(layer.Style) && layer.Style.length > 0
                && layer.Style[0].LegendURL && $.isArray(layer.Style[0].LegendURL) && layer.Style[0].LegendURL.length > 0
                && layer.Style[0].LegendURL[0].OnlineResource) {
                layerInfo.legendIcon = layer.Style[0].LegendURL[0].OnlineResource;
            }
            layerInfo.serviceInfo = {
                type: "WMS",
                url: sourceURL,
                targetPrj: layer.CRS ? layer.CRS[0] : layer.SRS,
                useProxy: true,
                params: {
                    VERSION: version,
                    layers: layer.Name
                }
            };
            parentObject.sub[layer.Name.replace(/\//g, "$")] = layerInfo;
        }
    }

    /**
    * @summary 加入一個WMTS endpoint
    * @param {string} parnetID - 要加入的指定群組
    * @param {string} sourceURL - WMTS endpoint URL
    * @param {function} _callback - 此WMS endpoint的圖層資訊加入後，呼叫此function
    */
    var result;
    this.addWMTSSource = function (parentID, sourceURL, _callback) {
        var wmtsReqURL = null;
        if (sourceURL.indexOf("?") > -1) {
            wmtsReqURL = sourceURL + "&service=wmts&request=GetCapabilities"
        } else {
            wmtsReqURL = sourceURL + "?service=wmts&request=GetCapabilities"
        }
        // 利用proxy去讀取，才不會有cross domain的issue
        $.ajax("service/proxy.ashx?url=" + encodeURIComponent(wmtsReqURL))
            .then(function (resp) {
                var parser = new ol.format.WMTSCapabilities();
                result = parser.read(resp);
                if (result.Contents) {
                    var baseLayer = result.Contents;
                    var layerInfo = {
                        sub: {}
                    };
                    genWMTSLayerInfo(layerInfo, baseLayer, sourceURL, result.version, result);
                    for (var key in layerInfo.sub) {
                        layerInfo = layerInfo.sub[key];
                        break;
                    }
                    me.addLayerInfo(parentID, new Date().getTime().toString(), layerInfo);
                    if (_callback) {
                        _callback();
                    }
                }
            });
    };

    function genWMTSLayerInfo(parentObject, layers, sourceURL, version, Result) {
        var key = (new Date().getTime() + "_").substr(9) + Math.round(Math.random() * 100000000);
        if (layers.Layer) {
            var layerInfo = {
                name: result.ServiceIdentification.Title,
                type: "folder",
                sub: {}
            };
            parentObject.sub[key] = layerInfo;
            if ($.isArray(layers.Layer)) {
                for (var i = 0; i < layers.Layer.length; i++) {
                    genWMTSLayerInfo(layerInfo, layers.Layer[i], sourceURL, version);
                }
            } else {
                genWMTSLayerInfo(layerInfo, layers.Layer, sourceURL, version);
            }
        } else {
            var layerInfo = {
                name: layers.Title,
                type: "node",
                legendIcon: "images/map_legend/empty.png"
            };

            layerInfo.serviceInfo = {
                type: "WMTS",
                result: result,
                url: sourceURL,
                format: layers.Format[0],
                style: layers.Style[0].Identifier,
                targetPrj: "EPSG:3857",
                matrixSet: layers.TileMatrixSetLink[0].TileMatrixSet,
                useProxy: true,
                params: {
                    VERSION: version,
                    layer: layers.Identifier,
                }
            };
            parentObject.sub[layers.Identifier.replace(/\//g, "$")] = layerInfo;
        }
    }

    /**
    * @summary 加入一個WFS endpoint
    * @param {string} parnetID - 要加入的指定群組
    * @param {string} sourceURL - WFS endpoint URL
    * @param {function} _callback - 此WFS endpoint的圖層資訊加入後，呼叫此function
    */
    this.addWFSSource = function (parentID, sourceURL, _callback) {
        var wfsReqURL = null;
        if (sourceURL.indexOf("?") > -1) {
            wfsReqURL = sourceURL + "&service=wfs&request=GetCapabilities&version=1.0.0"
        } else {
            wfsReqURL = sourceURL + "?service=wfs&request=GetCapabilities&version=1.0.0"
        }
        $.ajax("service/proxy.ashx?url=" + encodeURIComponent(wfsReqURL))
            .then(function (resp) {
                if (resp.documentElement.tagName.toLowerCase() != "wfs_capabilities") {
                    alert("WFS 加入失敗！！\n請確認網址正確與否，或WFS是否支援1.0.0版本");
                    return;
                }
                var $resp = $(resp.documentElement);
                var version = $resp.attr("version");
                if (version) {
                    if (['1.0.0'].indexOf(version) < 0) {
                        alert("不支援WFS " + version);
                        return;
                    }
                }

                var $layers = $resp.find("FeatureType");
                var layerInfo = {
                    name: sourceURL,
                    type: "folder",
                    sub: {}
                };
                genWFSLayerInfo(layerInfo, $layers, sourceURL, version);
                me.addLayerInfo(parentID, new Date().getTime().toString(), layerInfo);
                if (_callback) {
                    _callback();
                }
            });
    };

    function genWFSLayerInfo(parentObject, $layers, sourceURL, version) {
        var errMsg = "";
        for (var i = 0; i < $layers.length; i++) {
            var key = (new Date().getTime() + "_").substr(9) + Math.round(Math.random() * 100000000);
            var $layer = $($layers[i]);
            var title = $layer.find("Title").text();
            var prj = $layer.find("DefaultSRS").text();
            if (!prj) {
                prj = $layer.find("SRS").text();
            }
            if (!prj) {
                prj = $layers.find("CRS").text();
            }
            if (!ol.proj.get(prj)) {
                errMsg += (errMsg == "" ? "" : "\n") + "不支援[" + title + "]的坐標系統" + prj;
                continue;
            }
            var layerInfo = {
                name: title,
                type: "node",
                legendIcon: "images/map_legend/empty.png"
            };
            layerInfo.serviceInfo = {
                type: "WFS",
                url: sourceURL,
                useProxy: true,
                targetPrj: prj,
                params: {
                    VERSION: version,
                    layer: $layer.find("Name").text()
                },
                style: defaultStyle,
                bubbleContent: "#AUTO#"
            };
            parentObject.sub[key] = layerInfo;
        }
        if (errMsg != "") {
            alert(errMsg);
        }
    }

    function genLayer(layerInfo) {
        var serviceInfo = layerInfo.serviceInfo;
        var serviceType = serviceInfo.type.toUpperCase();
        if (serviceType == "GEOSERVER") {
            if (layerInfo.editable) {
                serviceType = "WFS";
                serviceInfo.params.VERSION = "2.0.0";
            } else {
                serviceType = "WMS";
                serviceInfo.params.VERSION = "1.3.0";
                if (!serviceInfo.params.layers) {
                    serviceInfo.params.layers = serviceInfo.params.layer;
                }
            }
        }
        switch (serviceType) {
            case "TILEWMS":
                return genTileWMSLayer(serviceInfo);
            case "WMS":
                return genWMSLayer(serviceInfo);
            case "IMGARCGIS":
                return genImageArcGIS(serviceInfo);
            case "WFS":
                return genWFSLayer(serviceInfo, getLayerID(layerInfo));
            case "KML":
                return genKMLLayer(serviceInfo, getLayerID(layerInfo));
            case "GML":
                return genGMLLayer(serviceInfo, getLayerID(layerInfo));
            case "STATIC":
                return genStaticLayer(serviceInfo, getLayerID(layerInfo));
            case "VECTOR":
                return genVectorLayer(layerInfo.serviceInfo, getLayerID(layerInfo));
            case "WMTS":
                return genWMTSLayer(serviceInfo);
            case "HEATMAP":
                return genHEATMAPLayer(serviceInfo);
        }
    }

    function genTileWMSLayer(serviceInfo) {
        var layer;
        var params = JSON.parse(JSON.stringify(serviceInfo.params));

        for (var key in params) {
            if (key.toLowerCase() == "outputformat") {
                delete params[key];
            }
        }

        layer = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: serviceInfo.url,
                // 如果該service不允許cross domain，不可以加crossOrigin，否則request該圖會失敗
                crossOrigin: serviceInfo.useProxy ? undefined : 'anonymous',
                params: params,
                ratio: serviceInfo.ratio,
                imageLoadFunction: serviceInfo.useProxy ?
                    function (image, src) {
                        image.getImage().src = "service/proxy.ashx?url=" + encodeURIComponent(src);
                    } : undefined,
            })
        });

        return layer;
    }

    function genWMSLayer(serviceInfo) {
        var layer;
        var params = JSON.parse(JSON.stringify(serviceInfo.params));
        for (var key in params) {
            if (key.toLowerCase() == "outputformat") {
                delete params[key];
            }
        }
        layer = new ol.layer.Image({
            //extent: extent,
            source: new ol.source.ImageWMS({
                url: serviceInfo.url,
                // 如果該service不允許cross domain，不可以加crossOrigin，否則request該圖會失敗
                crossOrigin: serviceInfo.useProxy ? undefined : 'anonymous',
                params: params,
                ratio: serviceInfo.ratio,
                imageLoadFunction: serviceInfo.useProxy ?
                    function (image, src) {
                        image.getImage().src = "service/proxy.ashx?url=" + encodeURIComponent(src);
                    } : undefined,
            })
        });

        return layer;
    }

    function genWMTSLayer(serviceInfo) {
        var layer;
        var result = serviceInfo.result;
        var options = ol.source.WMTS.optionsFromCapabilities(result,
            {
                layer: serviceInfo.params.layer,
                matrixSet: serviceInfo.matrixSet,
                projection: serviceInfo.targetPrj,
                requestEncoding: "RESTful",
            });

        layer = new ol.layer.Tile({
            source: new ol.source.WMTS(options)
        });

        layer.getSource().setTileLoadFunction(
            serviceInfo.useProxy ?
                function (imageTile, src) {
                    imageTile.getImage().src = "service/proxy.ashx?url=" + encodeURIComponent(src);
                } : undefined
        );
        return layer;
    }

    function genImageArcGIS(serviceInfo) {
        var layer;
        var params = JSON.parse(JSON.stringify(serviceInfo.params));
        for (var key in params) {
            if (key.toLowerCase() == "outputformat") {
                delete params[key];
            }
        }
        layer = new ol.layer.Image({
            //extent: extent,
            source: new ol.source.ImageArcGISRest({
                url: serviceInfo.url,
                // 如果該service不允許cross domain，不可以加crossOrigin，否則request該圖會失敗
                crossOrigin: serviceInfo.useProxy ? undefined : 'anonymous',
                params: params,
                ratio: serviceInfo.ratio,
                //imageLoadFunction: serviceInfo.imageLoadFunction,
                projection: serviceInfo.targetPrj,
                imageLoadFunction: serviceInfo.useProxy ?
                    function (image, src) {
                        image.getImage().src = "service/proxy.ashx?url=" + encodeURIComponent(src);
                    } : undefined
            })
        });

        return layer;
    }

    function genWFSLayer(serviceInfo, layerID) {
        var maxFeatureCount, vector;
        function calculateClusterInfo(resolution) {
            maxFeatureCount = 0;
            var features = layer.getSource().getFeatures();
            var feature, radius;
            for (var i = features.length - 1; i >= 0; --i) {
                feature = features[i];
                var originalFeatures = feature.get('features');
                var extent = ol.extent.createEmpty();
                var j, jj;
                for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
                    ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
                }
                maxFeatureCount = Math.max(maxFeatureCount, jj);
                radius = 0.25 * (ol.extent.getWidth(extent) + ol.extent.getHeight(extent)) / resolution;
                feature.set('radius', radius);
            }
        }
        var currentResolution;
        var styleFunc =
            function (feature, resolution) {
                var serviceInfo = feature.serviceInfo;
                if (resolution != currentResolution) {
                    calculateClusterInfo(resolution);
                    currentResolution = resolution;
                }
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: feature.get('radius'),
                            fill: new ol.style.Fill(serviceInfo.cluster.style.fill),
                            stroke: new ol.style.Stroke(serviceInfo.cluster.style.fill)
                        }),
                        text: new ol.style.Text({
                            text: size.toString(),
                            fill: new ol.style.Fill(serviceInfo.cluster.style.text.fill),
                            stroke: new ol.style.Stroke(serviceInfo.cluster.style.text.stroke)
                        })
                    });
                } else {
                    var originalFeature = feature.get('features')[0];
                    style = getStyleFromConfig(serviceInfo.style);
                    if (typeof (style) === "function") {
                        style = style(originalFeature, resolution);
                    }
                }
                return style;
            };

        var loader =
            function (extent, resolution, projection) {
                var targetExtent;
                var serviceInfo = this.serviceInfo;
                if (serviceInfo.srcPrj) {
                    targetExtent = ol.proj.transformExtent(extent, projection, serviceInfo.srcPrj);
                } else {
                    targetExtent = ol.proj.transformExtent(extent, projection, serviceInfo.targetPrj);
                }
                if (serviceInfo.invertedAxis) {
                    targetExtent = [targetExtent[1], targetExtent[0], targetExtent[3], targetExtent[2]];
                }
                var firstConcatSymbol = "?";
                if (serviceInfo.url.indexOf("?") >= 0) {
                    firstConcatSymbol = "&";
                }
                var typeNameParamName = "typeNames";
                if (serviceInfo.params.VERSION.split(".")[0] == "1") {
                    typeNameParamName = "typeName";
                }
                var baseUrl = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
                var url = baseUrl + firstConcatSymbol
                    + "service=wfs&version=" + serviceInfo.params.VERSION
                    + "&request=GetFeature"
                    + "&" + typeNameParamName + "=" + serviceInfo.params.layer
                    + (serviceInfo.params.outputFormat ? "&outputFormat=" + serviceInfo.params.outputFormat : "")
                    + "&srsName=" + serviceInfo.targetPrj;
                if (serviceInfo.params.cql_filter) {
                    url += "&cql_filter="
                        + encodeURIComponent(serviceInfo.params.cql_filter
                            + " and BBOX(geometry," + targetExtent.join(",") + ")");
                } else {
                    if (targetExtent.indexOf(Infinity) < 0) {
                        url += "&BBOX=" + targetExtent.join(",");
                    }
                }
                if (serviceInfo.useProxy) {
                    url = "service/proxy.ashx?url=" + encodeURIComponent(url);
                }
                var source = this;
                //var arFeatures = features.getArray();
                //for(var i = 0 ; i < arFeatures.length ;i++) {
                //    source.removeFeature(arFeatures[i]);
                //}
                $.ajax(url).then(function (response, statusText, jqXHR) {
                    var respFormat = getRespFormat(response, jqXHR);
                    var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: projection });
                    source.addFeatures(features);
                });
            };


        var source = null;
        var strategy = null;
        if (serviceInfo.cluster) strategy = ol.loadingstrategy.bbox;
        else if (serviceInfo.strategy) strategy = ol.loadingstrategy[serviceInfo.strategy];
        else {
            strategy = ol.loadingstrategy.tile(ol.tilegrid.createXYZ({ maxZoom: 19 }));
        }
        source = new ol.source.Vector({
            loader: loader,
            strategy: strategy
            //strategy: ol.loadingstrategy.bbox
        });
        source.serviceInfo = serviceInfo;

        if (serviceInfo.cluster) {
            source = new ol.source.Cluster({
                distance: 40,
                source: source
            });
            source.on('addfeature', function (evt) {
                evt.feature.serviceInfo = source.serviceInfo;
            });
            source.serviceInfo = serviceInfo;
        }
        var layer = new ol.layer.Vector({
            layerID: layerID,
            source: source,
            style: serviceInfo.cluster ? styleFunc : getStyleFromConfig(serviceInfo.style),
            projection: serviceInfo.targetPrj
        });
        layer.serviceInfo = serviceInfo;
        return layer;
    }

    function genKMLLayer(serviceInfo, layerID) {
        var layer;
        var url = serviceInfo.url;
        if (serviceInfo.useProxy) {
            url = "service/proxy.ashx?url=" + encodeURIComponent(url);
        }
        layer = new ol.layer.Vector({
            layerID: layerID,
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.KML()
            })
        });
        return layer;
    }

    function genHEATMAPLayer(serviceInfo) {
        var layer;
        var url = serviceInfo.url;
        if (serviceInfo.useProxy) {
            url = "service/proxy.ashx?url=" + encodeURIComponent(url);
        }
        layer = new ol.layer.Heatmap({
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.KML({
                    extractStyles: false
                })
            }),
            blur: parseInt(serviceInfo.blur, 10),
            radius: parseInt(serviceInfo.radius, 10)
        });

        layer.getSource().on('addfeature', function (event) {
            // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
            // standards-violating <magnitude> tag in each Placemark.  We extract it from
            // the Placemark's name instead.
            var name = event.feature.get('name');
            var magnitude = parseFloat(name.substr(2));
            event.feature.set('weight', magnitude - 5);
        });

        return layer;
    }

    function genStaticLayer(serviceInfo, layerID) {
        var layer;
        var url = serviceInfo.url;
        if (serviceInfo.useProxy) {
            url = "service/proxy.ashx?url=" + encodeURIComponent(url);
        }
        layer = new ol.layer.Image({
            layerID: layerID,
            source: new ol.source.ImageStatic({
                url: url,
                projection: serviceInfo.params.projection,
                imageExtent: serviceInfo.params.imageExtent
            })
        });
        return layer;
    }

    function genGMLLayer(serviceInfo, layerID) {
        var resp = null;
        var url = serviceInfo.url;
        if (serviceInfo.useProxy) {
            url = "service/proxy.ashx?url=" + encodeURIComponent(url);
        }
        $.ajax({ url: url, async: false }).then(
            function (_resp) {
                resp = _resp;
            },
            function () {
                alert("GML讀取失敗");
            }
        );
        if (!resp) return null;
        var layer;
        layer = new ol.layer.Vector({
            layerID: layerID,
            source: new ol.source.Vector()
        });
        var gmlFormat = null;
        var gmlNS = null;
        for (var i = 0; i < resp.documentElement.attributes.length; i++) {
            if (resp.documentElement.attributes[i].nodeValue == "http://www.opengis.net/gml") {
                gmlNS = resp.documentElement.attributes[i].nodeValue;
                break;
            }
        }
        if (!gmlNS) {
            alert("抱歉，本系統僅支援GML3.1.1與GML2.1.2");
            return null;
        }
        var $position = $(resp).find("coordinates:first");
        var srsName = $(resp).find("*[srsName]:first").attr("srsName");
        if ($position.length > 0) {
            gmlFormat = new ol.format.GML2({
                srsName: srsName
            });
        } else {
            gmlFormat = new ol.format.GML3({
                srsName: srsName
            });
        }
        layer.getSource().addFeatures(gmlFormat.readFeatures(resp, {
            dataProjection: srsName,
            featureProjection: "EPSG:3857"
        }));
        return layer;
    }

    /**
     * @summary 產生向量資料來源的圖層
     * @param {Object} serviceInfo 如果不內含dataParser(需要有url)或loader，則以serviceInfo當作ol.source.Vector的options
     * @param {String} 圖層identity
     * @protected
    */
    function genVectorLayer(serviceInfo, layerID) {
        var layer;
        var loader = undefined;

        // 如果有url與dataParser就自己去抓資料回來parse
        if (serviceInfo.url && serviceInfo.dataParser) {
            loader = function () {
                if (serviceInfo && serviceInfo.url) {
                    // 如果vector有資料來源
                    if (serviceInfo.dataParser) {
                        // 如果資料需要parse
                        $.ajax(serviceInfo.url).then(function (resp) {
                            var features = serviceInfo.dataParser(resp);
                            source.addFeatures(features);
                        });
                    }
                }
            }
        } else if (serviceInfo.loader) {
            // 如果有設定loader就使用loader
            loader = serviceInfo.loader;
        }

        var sourceOptions = {};
        if (loader) {
            sourceOptions = {
                url: serviceInfo.url,
                loader: loader,
                strategy: ol.loadingstrategy[serviceInfo.strategy]
            };
        } else {
            sourceOptions = serviceInfo;
        }

        var source = new ol.source.Vector(sourceOptions);
        layer = new ol.layer.Vector({
            layerID: layerID,
            source: source,
            style: getStyleFromConfig(serviceInfo.style)
        });

        return layer;
    }

    var getStyleFromConfig = plugin.getStyleFromOption;

    /**
    * @summary 在圖台上加入一個圖層顯示
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @return {ol.layer.Layer} 回傳一個圖層Object
    */
    this.addLayer = function (layerInfoOrID) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var layer = me.getLayer(layerInfo);
        var layerGroup = me.getLayerGroup(layerInfo);
        if (layer != null) {
            if (layer.getVibile() && layerGroup.getLayers().getArray().indexOf(layer) < 0) {
                layerGroup.getLayers().addLayer(layer);
            }
            return layer;
        }

        layer = genLayer(layerInfo);
        layer.setZIndex(layerGroup.getZIndex());
        if (layer == null) return null;
        layersInstance[getLayerKey(layerInfo)] = layer;
        layerGroup.getLayers().push(layer);
        return layer;
    };

    /**
    * @summary 取得指定的圖層物件
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @return {ol.layer.Layer} 回傳一個圖層Object
    */
    this.getLayer = function (layerInfoOrID) {
        var layerInfo = null;
        if (layerInfoOrID == undefined) {
            return;
        }
        if (typeof (layerInfoOrID) == "string") {
            layerInfo = me.getLayerInfo(layerInfoOrID);
        } else {
            layerInfo = layerInfoOrID;
        }
        var serviceInfo = layerInfo.serviceInfo;
        var layerKey = getLayerKey(layerInfo);
        if (layerKey) {
            return layersInstance[layerKey];
        } else {
            return null;
        }
    };

    this.refreshLayer = function (layerInfoOrID) {
        setTimeout(
            function () {
                var source = me.getLayer(layerInfoOrID).getSource();
                if (source) {
                    source.clear();
                    source.refresh();
                }
            },
            10
        );
    }

    /**
    * @summary 取得指定圖層的LayerInfo
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層，可以是`String`(layer ID)或`LayerInfo`(圖層設定Object)
    * @return {LayerInfo} 指定圖層的LayerInfo
    */
    this.getLayerInfo = function (layerInfoOrID) {
        if (!layerInfoOrID) {
            return layersInfo;
        }
        if (typeof (layerInfoOrID) != "string") {
            return layerInfoOrID;
        }
        var path = layerInfoOrID.split("/");
        if (path.length == 0) return layersInfo;
        var joinToken = '"].sub["';
        var evalPath = '["' + path.join(joinToken) + '"]';

        try {
            return eval("layersInfo" + evalPath);
        } catch (e) {
            return null;
        }
    };

    /**
    * 取得指定圖層所在的圖層群組GroupInfo
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @return {GroupInfo} 指定圖層所在的圖層群組GroupInfo
    */
    this.getParentInfo = function (layerInfoOrID) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var layerID = layerInfo.layerID;
        var arPath = layerID.split('/');
        arPath.length = arPath.length - 1;
        var parentID = arPath.join('/');
        return me.getLayerInfo(parentID);
    };

    /**
    * @summary 取得分頁的features
    * @desc 只支援wfs 2.0.0
    * 如果service type是WMS，則模擬成wfs
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {Object} queryOption
    *                 圖資撈取的條件  
    *                 queryOption.bbox - bbox  
    *                 queryOption.proj - bbox的坐標系統
    *                 queryOption.filter - wfs request xml
    * @param {int} pageSize 取得筆數
    * @param {int} startIndex 開始取圖資的索引值
    * @param {function} callback 
    *                   圖資取得後，呼叫此function  
    *                   args[0].features `ol.Feature[]` 取得的圖資  
    *                   args[0].hasMore `boolean` 是否有更多圖資
    *                   args[0].total `int` 總更筆數
    * @return {jqXHR} 此request的jqXHR
    */
    this.getPagingFeatures = function (layerInfoOrID, queryOption, pageSize, startIndex, callback) {
        var layerInfo = layerInfoOrID;
        if (typeof (layerInfo) == "string") {
            layerInfo = me.getLayerInfo(layerInfoOrID);
        }
        var serviceInfo = layerInfo.serviceInfo;
        //if (serviceInfo.type.toUpperCase() != "WFS") {
        //    throw new Error("分頁的服務必須是WFS");
        //}
        var typeName = serviceInfo.params.layer ? serviceInfo.params.layer : serviceInfo.params.layers;
        var baseUrl = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var url = baseUrl + "?service=wfs&version=2.0.0&request=GetFeature"
            + "&typeNames=" + typeName + "&outputFormat=json"
            + "&srsName=" + serviceInfo.targetPrj
            + "&count=" + pageSize
            + "&startIndex=" + startIndex;
        if (serviceInfo.params.cql_filter) {
            url += "&cql_filter=" + encodeURIComponent(serviceInfo.params.cql_filter);
        }
        if (queryOption.bbox && $.isArray(queryOption.bbox) && queryOption.bbox.length == 4) {
            var extent = queryOption.bbox;
            if (queryOption.proj) {
                if (serviceInfo.srcPrj) {
                    extent = ol.proj.transformExtent(extent, queryOption.proj, serviceInfo.srcPrj);
                } else {
                    extent = ol.proj.transformExtent(extent, queryOption.proj, serviceInfo.targetPrj);
                }
            }
            if (serviceInfo.invertedAxis) {
                extent = [extent[1], extent[0], extent[3], extent[2]];
            }
            url += "&bbox=" + extent.join(",");
        }
        var proxyUrl = "service/proxy.ashx?url=" + encodeURIComponent(url);
        var ret = null;
        $.ajax(proxyUrl, {
            method: "POST", data: queryOption.filter,
            contentType: "text/xml; charset=utf-8",
            beforeSend: function (jqXHR) { ret = jqXHR; }
        })
            .then(
                function (response, statusText, jqXHR) {
                    var respFormat = getRespFormat(response, jqXHR);
                    var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                    if (callback) {
                        callback({
                            features: features,
                            hasMore: startIndex + features.length < response.totalFeatures,
                            total: response.totalFeatures
                        });
                    }
                }
            );

        return ret;
    };

    /**
    * @summary [WFS only]取得指定圖層的schema
    * @param {LayerInfo} layerInfo 指定圖層
    * @param {function} callback 
    *                   取得schema呼叫此function  
    *                   args[0]為entity.FieldInfo[]  
    *                   entity.FieldInfo擁有3個屬性  
    *                   &nbsp;&nbsp; name - 欄位名稱  
    *                   &nbsp;&nbsp; type - 資料型態，請參考XSD type  
    *                   &nbsp;&nbsp; nullable - 可否為null
    */
    this.getLayerSchema = function (layerInfo, callback) {
        var serviceInfo = layerInfo.serviceInfo;
        var baseUrl = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var url = baseUrl + "?service=wfs&version=1.1.0&request=DescribeFeatureType"
            + "&typeName=" + serviceInfo.params.layer;
        if (layerInfo.schema) callback(layerInfo.schema);
        $.ajax(url).then(function (response) {
            $xml = $(response);
            var schema = [];
            var $elements = $(response.getElementsByTagNameNS('http://www.w3.org/2001/XMLSchema', 'element'));
            for (var i = 0; i < $elements.length; i++) {
                var n = $($elements[i]);
                if (n.attr("type").indexOf("xsd") == 0) {
                    schema.push({
                        name: n.attr("name"),
                        dataType: n.attr("type"),
                        nullable: n.attr("nillable") || n.attr("nillable").toLowerCase() == "true"
                    });
                } else if (n.attr("type").indexOf("GeometryPropertyType") > -1) {
                    schema.push({
                        name: n.attr("name"),
                        dataType: "geometry",
                        nullable: n.attr("nillable") || n.attr("nillable").toLowerCase() == "true"
                    });
                }
            }
            layerInfo.schema = schema;
            if (callback) {
                callback(schema);
            }
        });
    };

    /**
    * @summary 取得指定圖層的欄位顯示文字
    * @desc
    * 如果layerInfo.fieldMapping中有設定`fieldName`的顯示文字，則回傳之；  
    * 如果沒有設定則回傳`fieldName`
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {String} fieldName - 指定欄位
    * @return {String} 欄位顯示的文字
    */
    this.getFieldLabel = function (layerInfoOrID, fieldName) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        if (layerInfo && layerInfo.fieldMapping && layerInfo.fieldMapping[fieldName]) {
            return layerInfo.fieldMapping[fieldName];
        } else {
            return fieldName;
        }
    };

    /**
    * @summary 產生圖資的標籤文字  
    * @desc 依據layerInfo.serviceInfo.label.template產生其文字
    * @param {LayerInfo} layerInfo - 指定圖層
    * @param {ol.Feature} feature - 圖資
    * @return {String} 產生的標籤文字
    */
    this.genLabel = function (layerInfo, feature) {
        var strLabel = layerInfo.serviceInfo.label.template;
        strLabel = plugin.genContentFromFeature(feature, strLabel);
        return strLabel;
    };


    /** 
    * @summary 取得kml url
    * @desc 如果layerInfo.kmlUrl沒有設定，則當作geoserver的設定
    * @param {LayerInfo} layerInfo
    * @param {boolean} bDownload - true的時候，回傳的網址可以用來讓使用者透過瀏覽器下載kml，而不是直接顯示在瀏覽器裡
    * @return {String} kml網址
    */
    this.getKMLUrl = function (layerInfo, bDownload) {
        var retUrl = null;
        if (layerInfo.kmlUrl) {
            retUrl = layerInfo.kmlUrl;
        } else {
            retUrl = gisServerURL + "wms/kml?layers=" + layerInfo.serviceInfo.params.layer + "&styles=";
            if (layerInfo.geometryType == "point") {
                retUrl += "kml_icon";
            }
            if (layerInfo.serviceInfo.params.cql_filter) {
                retUrl += "&cql_filter=" + layerInfo.serviceInfo.params.cql_filter;
            }
        }
        retUrl += (bDownload ? "&mode=download" : "");
        return retUrl;
    };

    // 大量ajax request管控
    var jqXHRs = {};

    /*
    * [WFS only]依據bbox取得所有圖層的圖資  
    * 一次只能有一個request在執行，  
    * 如果第二次被呼叫，前一次的ajax就會被停止
    * @param {LayerInfo[]} layerInfos - Array of LayerInfo
    * @param {
    * @param _callback 每個layer的feature被抓到以後，就會呼叫一次
    */
    /* 無人使用，而且此function應該有問題
    this.getFeaturesByBBox = function (layerInfos, queryOption, pageSize, _callback) {
        for (var idx in jqXHRs) {
            if (jqXHRs[idx] && jqXHRs[idx].readStatus != "complete") {
                jqXHRs[idx].abort();
            }
        }
        jqXHRs = {};
        for (var idx = 0; i < layerInfos.length; i++) {
            var layerInfo = layerInfos[idx];
            getFeatureByBBox(layerInfo, queryOption, pageSize, _callback);
        }
    };
    */

    /**
    * @summary 依照bbox以分頁的方式撈取圖資
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {Object} queryOption
    *                 圖資撈取的條件  
    *                 queryOption.bbox - bbox  
    *                 queryOption.proj - bbox的坐標系統
    * @param {int} pageSize 取得筆數
    * @param {int} startIndex 開始取圖資的索引值
    * @param {function} _callback 
    *                   圖資取得後，呼叫此function  
    *                   args[0].features `ol.Feature[]` 取得的圖資  
    *                   args[0].hasMore `boolean` 是否有更多圖資
    *                   args[0].total `int` 總更筆數
    */
    this.getFeatureByBBox = function (layerInfoOrID, queryOption, pageSize, startIndex, _callback) {
        var serviceInfo = layerInfo.serviceInfo;
        if (!pageSize) pageSize = 100;
        if (typeof (startIndex) == "undefined") startIndex = 0;
        var layer = serviceInfo.params.layer ? serviceInfo.params.layer : serviceInfo.params.layers;
        var baseUrl = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var url = baseUrl + "?service=wfs&version=2.0.0&request=GetFeature"
            + "&typeNames=" + layer + "&outputFormat=json"
            + "&srsName=" + serviceInfo.targetPrj
            + "&count=" + pageSize
            + "&startIndex=" + startIndex;
        if (serviceInfo.params.cql_filter) {
            url += "cql_filter=" + encodeURIComponent(serviceInfo.params.cql_filter);
        }
        if (queryOption) {
            if (queryOption.bbox && $.isArray(queryOption.bbox) && queryOption.bbox.length == 4) {
                var extent = queryOption.bbox;
                if (queryOption.proj) {
                    if (serviceInfo.srcPrj) {
                        extent = ol.proj.transformExtent(extent, queryOption.proj, serviceInfo.srcPrj);
                    } else {
                        extent = ol.proj.transformExtent(extent, queryOption.proj, serviceInfo.targetPrj);
                    }
                }
                if (serviceInfo.invertedAxis) {
                    extent = [extent[1], extent[0], extent[3], extent[2]];
                }
                url += "&bbox=" + extent.join(",");
            }
        }
        $.ajax(url, { beforeSend: function (jqXHR) { jqXHRs[layerInfo.layerID] = jqXHR; } })
            .then(function (response, statusText, jqXHR) {
                var respFormat = getRespFormat(response, jqXHR);
                var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                jqXHRs[layerInfo.layerID] = null;
                if (callback) {
                    callback({
                        features: features,
                        hasMore: startIndex + features.length < response.totalFeatures,
                        total: response.totalFeatures
                    });
                }
            });
    };

    // layerInfo找到LayerID
    //this.getLayerID = function (layerInfo, layerInfosContainer) {
    //    if (!layerInfosContainer) layerInfosContainer = layersInfo;
    //    for (key in layerInfosContainer) {
    //        if (layerInfosContainer[key] == layerInfo) {
    //            return key;
    //        }
    //        if (layerInfosContainer[key].sub) {
    //            var subPath = this.getLayerID(layerInfo, layerInfosContainer[key].sub);
    //            if (subPath) {
    //                return key + "/" + subPath
    //            }
    //        }
    //    }
    //    return null;
    //}

    // 以layerInfo產生layers的key值
    function getLayerKey(layerInfo) {
        var serviceInfo = layerInfo.serviceInfo;
        if (!serviceInfo || !serviceInfo.type) return null;
        return layerInfo.layerID;
        if (serviceInfo.type.toUpperCase() == "WMS") {
            return serviceInfo.url.toLowerCase() + "&WMS&" + serviceInfo.params.layers;
        } else if (serviceInfo.type.toUpperCase() == "KML") {
            return serviceInfo.url.toLowerCase() + "&KML&";
        } else if (serviceInfo.type.toUpperCase() == "GML") {
            return serviceInfo.url.toLowerCase() + "&GML&";
        } else if (serviceInfo.type.toUpperCase() == "WFS") {
            return serviceInfo.url.toLowerCase() + "&WFS&" + serviceInfo.params.layer;
        } else if (serviceInfo.type.toUpperCase() == "GEOSERVER") {
            return serviceInfo.url.toLowerCase() + "&GEOSERVER&" + serviceInfo.params.layer;
        } else if (serviceInfo.type.toUpperCase() == "WMTS") {
            return serviceInfo.url.toLowerCase() + "&WMTS&" + serviceInfo.params.layers;
        } else if (serviceInfo.type.toUpperCase() == "HEATMAP") {
            return serviceInfo.url.toLowerCase() + "&HEATMAP&" + serviceInfo.params.layers;
        }
        return null;
    }

    // 以ol.layer的instance找到layerInfo，
    // 如果此layer instance不存在，回傳null
    function getLayerInfoByLayer(layer, layerInfosContainer) {
        if (!layerInfosContainer) layerInfosContainer = layersInfo;
        for (key in layerInfosContainer) {
            var nodeInfo = layerInfosContainer[key];
            if (!nodeInfo || !nodeInfo.type) continue;
            var key = getLayerKey(nodeInfo);
            if (nodeInfo.type == "folder" && nodeInfo.sub) {
                var layerInfo = getLayerInfoByLayer(layer, nodeInfo.sub);
                if (layerInfo) {
                    return layerInfo;
                }
            } else if (!key) {
                continue;
            } else if (nodeInfo.type == "node" && layersInstance[getLayerKey(nodeInfo)] == layer) {
                return nodeInfo;
            }
        }
        return null;
    }

    var bubbleID = "__layer_manager_bubble_content__";

    var $bubbleContent = $(defaultBubbleContainerHTML.replace(/^\s*<!\[CDATA\[/, '').replace(/]]>\s*$/, ''));
    //var ovFeatureInfo = new ol.Overlay({
    //    element: $bubbleContent[0],
    //    autoPan: true,
    //    autoPanAnimation: {
    //        duration: 250
    //    },
    //    offset: [0, 32]
    //});

    var ovFeatureInfo = oltmx.Bubble.get(bubbleID, {
        element: $bubbleContent[0],
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        },
        offset: [0, 32]
    });

    /**
    * @summary
    * 取得LayerManager的Bubble Overlay物件
    * @desc 基本上就是identify顯示用的overlay
    */
    this.getBubbleOverlay = function () {
        return ovFeatureInfo;
    };

    /**
    * 回傳透過vars中defaultBubbleContainerHTML產生的DOM element
    */
    this.get$bubbleContent = function () {
        return $bubbleContent;
    }

    this.showBubbleInfo = function (coord) {
        // 是否使用泡泡視窗
        if (mapOptions.showBubble) {
            if ($bubbleContent.find(".BubleTable").children().length > 0) {
                ovFeatureInfo.setMap(map);
                ovFeatureInfo.setPosition(coord);
            }
        }
    }

    this.hideBubbleInfo = function () {
        ovFeatureInfo.setMap(null);
    }

    $bubbleContent.find(".close").on('click', function () {
        me.hideBubbleInfo();
    });

    var ajaxIdentify = {};
    var featureFromIdentify = {};
    /** 
    * @summary
    * 在identify取得的feature裡取得指定Layer指定featureID的feature
    * @param {string} layerID - layer ID
    * @param {string} Id - feature ID
    * @param {ol.Feature} 指定的圖資
    */
    this.getFeatureFromIdentify = function (layerID, Id) {
        try {
            return featureFromIdentify[layerID][Id];
        } catch (e) {
            return null;
        }
    };

    var jQueryIDInvalidChar = /([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g;
    /**
    * @summary
    * 依據指定的坐標identify所有顯示的圖層  
    * 且該圖層的LayerInfo必須有bubbleContent  
    * tolerance = map.getView().getResolution() * 5
    * @param {ol.Coordinate} coord - 坐標
    * @private
    */
    this.identifyAll = function (coord) {
        for (var idx in ajaxIdentify) {
            if (ajaxIdentify[idx] && ajaxIdentify[idx].readStatus != "complete") {
                ajaxIdentify[idx].abort();
            }
        }
        ajaxIdentify = {};
        featureFromIdentify = {};
        $bubbleContent.find(".BubleTable").children().remove();

        var tolerance = map.getView().getResolution() * 5;
        var toleranceExtent = [coord[0] - tolerance, coord[1] - tolerance, coord[0] + tolerance, coord[1] + tolerance];
        //var tmpFeatures = plugin.getFeatureIntersectingExtent(toleranceExtent);
        //var contentFeatures = [];
        //for (var i = 0; i < tmpFeatures.length; i++) {
        //    contentFeatures.push(tmpFeatures[i]);
        //}
        //if (contentFeatures.length > 0) {
        //    $bubbleContent.append("");
        //}

        var extent = plugin.get2DExtent();
        var mapSize = map.getSize();
        var me = this;
        var bShow = false;
        for (var key in layersInstance) {
            var layer = layersInstance[key];
            if (!layer.getVisible()) {
                continue;
            }
            var layerInfo = getLayerInfoByLayer(layer);
            if (!layerInfo.serviceInfo.bubbleContent) {
                continue;
            }
            var layerID = getLayerID(layerInfo);
            var layerContent = '<tr><th>' + layerInfo.name + '</th></tr>'
                + '<tr><td id="identity_' + $('<div/>').text(layerID).html() + '" ><img src="./App_Themes/Map/images/loading-balls.gif"></td></tr>';
            $bubbleContent.find(".BubleTable").append(layerContent);
            var $theContent = $bubbleContent.find("#identity_" + layerID.replace(jQueryIDInvalidChar, "\\$1"));
            var serviceInfo = layerInfo.serviceInfo;
            if (!ol.source.Vector.prototype.isPrototypeOf(layer.getSource())) {
                var layerCoord = plugin.transCoordinateFromMapPrj(coord, serviceInfo.targetPrj);
                var layerRes = ol.proj.getPointResolution(ol.proj.get(serviceInfo.targetPrj), map.getView().getResolution(), layerCoord);
                //var layerRes = oltmx.util.Proj.calculateSourceResolution(serviceInfo.targetPrj, map.getView().getProjection(), coord, map.getView().getResolution());
                var url = layer.getSource()
                    .getGetFeatureInfoUrl(layerCoord, layerRes, serviceInfo.targetPrj,
                        {
                            'INFO_FORMAT': (serviceInfo.contentType ? serviceInfo.contentType : 'application/json'),
                            'query_layers': serviceInfo.params.layers
                        });
                var context = {};
                context.layerInfo = layerInfo;
                context.$theContent = $theContent;
                // get infomation from server
                $.ajax(url, { context: context, beforeSend: function (jqXHR) { ajaxIdentify[layerInfo.layerID] = jqXHR; } })
                    .then(function (response, statusText, jqXHR) {
                        var respFormat = getRespFormat(response, jqXHR);
                        var serviceInfo = this.layerInfo.serviceInfo;
                        try {
                            this.$theContent.children().remove();
                            var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                            featureFromIdentify[this.layerInfo.layerID] = {};
                            for (var i = 0; i < features.length; i++) {
                                featureFromIdentify[this.layerInfo.layerID][features[i].getId()] = features[i];
                                this.$theContent.append(me.genFeatureBubbleContent(this.layerInfo, features[i]));
                                if (serviceInfo.identifyCallback) {
                                    serviceInfo.identifyCallback(features[i], this.$theContent);
                                }
                            }
                            if (features.length == 0) {
                                this.$theContent.append("<table class='BubleTableS'><tr><th>無</th></tr></table>");
                            }
                        } catch (err) {
                            if (console && console.error) {
                                console.error(err.stack);
                            }
                        }
                        ajaxIdentify[layerInfo.layerID] = null;
                    });

            } else {
                var features = [];
                layer.getSource().forEachFeatureIntersectingExtent(toleranceExtent, function (feature) {
                    features.push(feature);
                });
                $theContent.children().remove();
                featureFromIdentify[layerInfo.layerID] = {};
                for (var i = 0; i < features.length; i++) {
                    featureFromIdentify[layerInfo.layerID][features[i].getId()] = features[i];
                    $theContent.append(me.genFeatureBubbleContent(layerInfo, features[i]));
                    if (serviceInfo.identifyCallback) {
                        serviceInfo.identifyCallback(features[i], $theContent);
                    }
                }
                if (features.length == 0) {
                    $theContent.append("<table class='BubleTableS'><tr><th>無</th></tr></table>");
                }
                bShow = true;
            }
        }
        if (!$.isEmptyObject(ajaxIdentify) || bShow) {
            var pixelPos = map.getPixelFromCoordinate(coord);
            // todo
            me.showBubbleInfo(coord);
        }
    };

    this.identify = this.identifyAll;

    // identify圖層群組的順序
    var identifyGroupIDPriority = ["point", "polyline", "polygon", "unknownType", "image"];

    /**
    * @summary
    * 依據指定的坐標identify圖層  
    * 且該圖層的LayerInfo必須有bubbleContent  
    * identify的圖層會依點、線、面、未知(依照LayerInfo的geometryType設定)的圖層群組順序，
    * 分批做圖徵識別，如果圖層群組有找到圖徵，便不繼續identify後面的群組
    * tolerance = map.getView().getResolution() * 5
    * @param {ol.Coordinate} coord - 坐標
    * @private
    */
    this.identifyLayersByGroup = function (coord) {
        // 關掉bubble info
        this.hideBubbleInfo();

        var hasLayer = false;
        find:
        for (var groupIdx = 0; groupIdx < identifyGroupIDPriority.length; groupIdx++) {
            var layers = mapPlugin.getLayerGroup(identifyGroupIDPriority[groupIdx]).getLayers().getArray();
            if (layers.length > 0) {
                for (var lyrIdx = 0; lyrIdx < layers.length; lyrIdx++) {
                    var layerInfo = getLayerInfoByLayer(layers[lyrIdx]);
                    if (!isLayerIdentifyable(layerInfo)) {
                        continue;
                    }
                    hasLayer = true;
                    break find;
                }
            }
        }
        if (!hasLayer) {
            // 如果沒有任何需要做動作的圖層
            setTimeout(function () {
                bufferControl.click();
            }, 500);
        }

        featureFromIdentify = {};
        layerDetailDIV = $bubbleContent;
        layerDetailDIV.find(".BubleTable").children().remove();
        layerDetailDIV.find(".BubleTable").append('<tr><td><img src="./App_Themes/Map/images/loading-balls.gif"></td></tr>');
        //ovFeatureInfo.setMap(map);
        //ovFeatureInfo.setPosition(coord);


        pixelFeatures[coord[0] + "," + coord[1]] = {};
        map.forEachFeatureAtPixel(map.getPixelFromCoordinate(coord), function (feature, layer) {
            var layerInfo = getLayerInfoByLayer(layer);
            if (layerInfo) {
                pixelFeatures[coord[0] + "," + coord[1]][layerInfo.layerID] = pixelFeatures[coord[0] + "," + coord[1]][layerInfo.layerID] || [];
                pixelFeatures[coord[0] + "," + coord[1]][layerInfo.layerID].push(feature);
            }
        });
        for (var key in pixelFeatures[coord[0] + "," + coord[1]]) {
            console.log(key);
            console.log(pixelFeatures[coord[0] + "," + coord[1]][key]);
        }

        //identifyNextGroup(0, coord);
        identifyNextGroupOnDownPage(0, coord);
    }

    /**
    * @summary
    * 依據指定的坐標開啟底部伸縮頁面並顯示坐標資訊  
    * 頁面分為坐標資訊、圖層查詢、圖層交集等頁籤 
    * 坐標資訊-顯示WGS84、TWD97、TWD67之坐標資訊
    * 圖層查詢-顯示目前開啟的圖層位置及名稱
    * 圖層交集-於圖台新增一個環域，與圖層進行交集查詢並顯示查詢結果
    * @param {ol.Coordinate} coord - 坐標
    * @private
    */
    this.IdentifyPosition = function (coord) {
        mapPlugin.clearFeatures(spatialResultLayerName);
        mapPlugin.clearFeatures("default");
        var pointStyleOpt = {
            icon: {
                anchor: [0.5, 32],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: "./App_Themes/map/images/location.png"
            }
        };

        var thepoint = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:3826');
        mapPlugin.addMarker(thepoint, thepoint.join(", "), pointStyleOpt);

        var latlon = ol.proj.transform(coord, "EPSG:3857", "EPSG:4326");
        var twd97 = ol.proj.transform(coord, "EPSG:3857", "EPSG:3826");
        var twd67 = ol.proj.transform(coord, "EPSG:3857", "EPSG:3828");

        if (tdWGS84 != undefined || tdWGS84 != null) {
            tdWGS84.innerText = round(latlon[1], 4) + ", " + round(latlon[0], 4);
            tdTWD97.innerText = Math.round(twd97[0]) + ", " + Math.round(twd97[1]);
            tdTWD67.innerText = Math.round(twd67[0]) + ", " + Math.round(twd67[1]);
            var googleLink = "http://maps.google.com/maps?f=q&source=s_q&z=16&layer=c&cbll=" + latlon[1] + "," + latlon[0];
            btnGoogleStreet.click(function () {
                window.open(googleLink);
            });
        }
    }

    // identify指定的group index
    function identifyNextGroup(groupIdx, coord) {
        var groupLayers = mapPlugin.getLayerGroup(identifyGroupIDPriority[groupIdx]).getLayers().getArray();
        ajaxIdentify = {};
        featureFromIdentify = {};
        if (groupLayers.length == 0) {
            // 如果此group沒有layer
            if (groupIdx == identifyGroupIDPriority.length - 1) {
                $bubbleContent.find(".BubleTable").children().remove();
                $bubbleContent.find(".BubleTable").append('<tr><td>無資料</td></tr>');
            } else {
                identifyNextGroup(groupIdx + 1, coord);
            }
            return;
        }
        for (var idx = 0; idx < groupLayers.length; idx++) {
            var layer = groupLayers[idx];
            if (!layer.getVisible()) {
                continue;
            }
            var layerInfo = getLayerInfoByLayer(layer);
            var serviceInfo = layerInfo.serviceInfo;
            if (!isLayerIdentifyable(layerInfo)) {
                continue;
            }
            if (!ol.source.Vector.prototype.isPrototypeOf(layer.getSource())) {
                var layerCoord = plugin.transCoordinateFromMapPrj(coord, serviceInfo.targetPrj);
                var layerRes = ol.proj.getPointResolution(serviceInfo.targetPrj, map.getView().getResolution(), layerCoord);
                //var layerRes = oltmx.util.Proj.calculateSourceResolution(serviceInfo.targetPrj, map.getView().getProjection(), coord, map.getView().getResolution());
                var url = layer.getSource()
                    .getGetFeatureInfoUrl(layerCoord, layerRes, serviceInfo.targetPrj,
                        {
                            'INFO_FORMAT': (serviceInfo.contentType ? serviceInfo.contentType : 'application/json'),
                            'query_layers': serviceInfo.params.layers,
                            'buffer': 5
                        });
                var context = {};
                context.layerInfo = layerInfo;
                // get infomation from server
                $.ajax(url,
                    {
                        context: context,
                        beforeSend: function (jqXHR) { ajaxIdentify[this.layerInfo.layerID] = jqXHR; },
                        coord: coord
                    }
                ).then(function (response, statusText, jqXHR) {
                    var respFormat = getRespFormat(response, jqXHR);
                    try {
                        var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                        var doBubbleInfo = true;
                        if (features.length == 0) {
                            // 沒有找到任何的圖徵
                        }
                        else if (this.layerInfo.serviceInfo.identifyAllCallback && typeof (this.layerInfo.serviceInfo.identifyAllCallback) == "function") {
                            doBubbleInfo = this.layerInfo.serviceInfo.identifyAllCallback(
                                {
                                    features: features,
                                    layerInfo: this.layerInfo,
                                    overlay: ovFeatureInfo,
                                    coord: this.coord
                                }
                            );
                        }

                        // 如果identifyAllCallback回傳false，此處就不處理
                        // 藉由serviceInfo.bubbleContent來顯示bubbleInfo
                        if (doBubbleInfo && this.layerInfo.serviceInfo.bubbleContent && this.layerInfo.serviceInfo.bubbleContent != "") {
                            //填入圖徵資訊到bubble info
                            if (me.fillFeatureIdentifyContent(this.layerInfo, features)) {
                                // 找到圖徵
                                // 顯示bubble info
                                me.showBubbleInfo(coord);
                            }
                        }


                    } catch (err) {
                        if (console && console.error) {
                            console.error(err.stack);
                        }
                    }
                    ajaxIdentify[this.layerInfo.layerID] = null;
                    var bFinished = true;
                    for (var key in ajaxIdentify) {
                        if (ajaxIdentify[key]) {
                            bFinished = false;
                            break;
                        }
                    }
                    if (bFinished) {
                        if (groupIdx == identifyGroupIDPriority.length - 1) {
                            if ($.isEmptyObject(featureFromIdentify)) {
                                $bubbleContent.find(".BubleTable").children().remove();
                                $bubbleContent.find(".BubleTable").append('<tr><td>無資料</td></tr>');
                            } else {
                                $bubbleContent.find(".BubleTable > tbody > tr").last().remove();
                            }
                        } else {
                            if ($.isEmptyObject(featureFromIdentify)) {
                                identifyNextGroup(groupIdx + 1, coord);
                            } else {
                                $bubbleContent.find(".BubleTable > tbody > tr").last().remove();
                            }
                        }
                    }
                });

            }
            else {
                var tolerance = map.getView().getResolution() * 5;
                var toleranceExtent = [coord[0] - tolerance, coord[1] - tolerance, coord[0] + tolerance, coord[1] + tolerance];

                var features = [];
                layer.getSource().forEachFeatureIntersectingExtent(toleranceExtent, function (feature) {
                    features.push(feature);
                });
                if (features.length > 0) {
                    // 找到圖徵

                    var doBubbleInfo = true;
                    // 執行 serviceInfo.identifyAllCallback
                    if (layerInfo.serviceInfo.identifyAllCallback && typeof (layerInfo.serviceInfo.identifyAllCallback) == "function") {
                        doBubbleInfo = layerInfo.serviceInfo.identifyAllCallback(
                            {
                                features: features,
                                layerInfo: layerInfo,
                                overlay: ovFeatureInfo,
                                coord: coord
                            }
                        );
                    }

                    // 如果identifyAllCallback回傳false，此處就不處理
                    // 藉由serviceInfo.bubbleContent來顯示bubbleInfo
                    if (doBubbleInfo && layerInfo.serviceInfo.bubbleContent && layerInfo.serviceInfo.bubbleContent != "") {
                        //填入圖徵資訊到bubble info
                        if (me.fillFeatureIdentifyContent(layerInfo, features)) {
                            // 找到圖徵
                            // 顯示bubble info
                            me.showBubbleInfo(coord);
                        }
                    }

                }
            }
        }

        if ($.isEmptyObject(ajaxIdentify)) {
            if (groupIdx == identifyGroupIDPriority.length - 1) {
                if ($.isEmptyObject(featureFromIdentify)) {
                    $bubbleContent.find(".BubleTable").children().remove();
                    $bubbleContent.find(".BubleTable").append('<tr><td>無資料</td></tr>');
                } else {
                    $bubbleContent.find(".BubleTable > tbody > tr").last().remove();
                }
            } else {
                if ($.isEmptyObject(featureFromIdentify)) {
                    identifyNextGroup(groupIdx + 1, coord);
                } else {
                    $bubbleContent.find(".BubleTable > tbody > tr").last().remove();
                }
            }
        }
    }

    // identify指定的group index
    function identifyNextGroupOnDownPage(groupIdx, coord) {
        var groupLayers = mapPlugin.getLayerGroup(identifyGroupIDPriority[groupIdx]).getLayers().getArray();
        ajaxIdentify = {};
        if (groupLayers.length == 0) {
            // 如果此group沒有layer
            if (groupIdx == identifyGroupIDPriority.length - 1) {
                layerDetailDIV.find(".BubleTable").children().remove();
                layerDetailDIV.find(".BubleTable").append('<tr><td>無資料</td></tr>');
                delete pixelFeatures[coord[0] + "," + coord[1]];
                if (identifyFinishEvent) identifyFinishEvent(featureFromIdentify);
            } else {
                identifyNextGroupOnDownPage(groupIdx + 1, coord);
            }
            if (groupIdx == 0) {
            }
            return;
        }

        for (var idx = 0; idx < groupLayers.length; idx++) {
            var layer = groupLayers[idx];
            if (!layer.getVisible()) {
                continue;
            }
            var layerInfo = getLayerInfoByLayer(layer);
            var serviceInfo = layerInfo.serviceInfo;
            if (!isLayerIdentifyable(layerInfo)) {
                continue;
            }
            if (!ol.source.Vector.prototype.isPrototypeOf(layer.getSource())) {
                var layerCoord = plugin.transCoordinateFromMapPrj(coord, serviceInfo.targetPrj);
                //var layerRes = ol.proj.getPointResolution(serviceInfo.targetPrj, map.getView().getResolution(), layerCoord);
                var layerRes = oltmx.util.Proj.calculateSourceResolution(serviceInfo.targetPrj, map.getView().getProjection(), coord, map.getView().getResolution());
                var url = layer.getSource()
                    .getGetFeatureInfoUrl(layerCoord, layerRes, serviceInfo.targetPrj,
                        {
                            'INFO_FORMAT': (serviceInfo.contentType ? serviceInfo.contentType : 'application/json'),
                            'query_layers': serviceInfo.params.layers,
                            'buffer': 5
                        });
                var context = {};
                context.layerInfo = layerInfo;
                // get infomation from server
                $.ajax(url,
                    {
                        context: context,
                        beforeSend: function (jqXHR) { ajaxIdentify[this.layerInfo.layerID] = jqXHR; },
                        coord: coord
                    }
                ).then(function (response, statusText, jqXHR) {
                    var respFormat = getRespFormat(response, jqXHR);
                    try {
                        var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                        var doBubbleInfo = true;

                        if (features.length > 0) {
                            featureFromIdentify[this.layerInfo.layerID] = {};
                            for (var i = 0; i < features.length; i++) {
                                featureFromIdentify[this.layerInfo.layerID][features[i].getId()] = features[i];
                            }
                        }

                        if (features.length == 0) {
                            // 沒有找到任何的圖徵
                        }
                        else if (this.layerInfo.serviceInfo.identifyAllCallback && typeof (this.layerInfo.serviceInfo.identifyAllCallback) == "function") {
                            doBubbleInfo = this.layerInfo.serviceInfo.identifyAllCallback(
                                {
                                    features: features,
                                    layerInfo: this.layerInfo,
                                    overlay: ovFeatureInfo,
                                    coord: this.coord
                                }
                            );
                        }

                        // 如果identifyAllCallback回傳false，此處就不處理
                        // 藉由serviceInfo.bubbleContent來顯示bubbleInfo
                        if (doBubbleInfo && this.layerInfo.serviceInfo.bubbleContent && this.layerInfo.serviceInfo.bubbleContent != "") {
                            //填入圖徵資訊到bubble info
                            if (me.fillFeatureIdentifyContent(this.layerInfo, features)) {
                                // 找到圖徵
                                // 顯示bubble info
                                me.showBubbleInfo(coord);
                            }
                        }
                    } catch (err) {
                        if (console && console.error) {
                            console.error(err.stack);
                        }
                    }
                    ajaxIdentify[this.layerInfo.layerID] = null;
                    var bFinished = true;
                    for (var key in ajaxIdentify) {
                        if (ajaxIdentify[key]) {
                            bFinished = false;
                            break;
                        }
                    }
                    if (bFinished) {
                        // 當ajax query都執行完成
                        if (groupIdx == identifyGroupIDPriority.length - 1) {
                            if ($.isEmptyObject(featureFromIdentify)) {
                                layerDetailDIV.find(".BubleTable").children().remove();
                                layerDetailDIV.find(".BubleTable").append('<tr><td>無資料</td></tr>');
                            } else {
                                layerDetailDIV.find(".BubleTable > tbody > tr").last().remove();
                            }
                            delete pixelFeatures[coord[0] + "," + coord[1]];
                            if (identifyFinishEvent) identifyFinishEvent(featureFromIdentify);
                        } else {
                            if ($.isEmptyObject(featureFromIdentify)) {
                                identifyNextGroupOnDownPage(groupIdx + 1, coord);
                            } else {
                                layerDetailDIV.find(".BubleTable > tbody > tr").last().remove();
                                delete pixelFeatures[coord[0] + "," + coord[1]];
                                if (identifyFinishEvent) identifyFinishEvent(featureFromIdentify);
                            }
                        }
                    }
                });

            }
            else {
                var features = pixelFeatures[coord[0] + "," + coord[1]][layerInfo.layerID] || [];

                if (features.length == 0) {
                    var tolerance = map.getView().getResolution() * 5;
                    var toleranceExtent = [coord[0] - tolerance, coord[1] - tolerance, coord[0] + tolerance, coord[1] + tolerance];
                    layer.getSource().forEachFeatureIntersectingExtent(toleranceExtent, function (feature) {
                        features.push(feature);
                    });
                }

                if (features.length > 0) {
                    featureFromIdentify[layerInfo.layerID] = {};
                    for (var i = 0; i < features.length; i++) {
                        featureFromIdentify[layerInfo.layerID][features[i].getId()] = features[i];
                    }
                }

                if (features.length > 0) {
                    // 找到圖徵
                    var doBubbleInfo = true;
                    // 執行 serviceInfo.identifyAllCallback
                    if (layerInfo.serviceInfo.identifyAllCallback && typeof (layerInfo.serviceInfo.identifyAllCallback) == "function") {
                        doBubbleInfo = layerInfo.serviceInfo.identifyAllCallback(
                            {
                                features: features,
                                layerInfo: layerInfo,
                                overlay: ovFeatureInfo,
                                coord: coord
                            }
                        );
                    }

                    // 如果identifyAllCallback回傳false，此處就不處理
                    // 藉由serviceInfo.bubbleContent來顯示bubbleInfo
                    if (doBubbleInfo && layerInfo.serviceInfo.bubbleContent && layerInfo.serviceInfo.bubbleContent != "") {
                        //填入圖徵資訊到bubble info
                        if (me.fillFeatureIdentifyContent(layerInfo, features)) {
                            // 找到圖徵
                            // 顯示bubble info
                            me.showBubbleInfo(coord);
                        }
                    }

                }
            }
        }

        // 如果沒有任何ajax query在進行
        if ($.isEmptyObject(ajaxIdentify)) {
            if (groupIdx == identifyGroupIDPriority.length - 1) {
                if ($.isEmptyObject(featureFromIdentify)) {
                    layerDetailDIV.find(".BubleTable").children().remove();
                    layerDetailDIV.find(".BubleTable").append('<tr><td>無資料</td></tr>');
                } else {
                    layerDetailDIV.find(".BubleTable > tbody > tr").last().remove();
                }
                delete pixelFeatures[coord[0] + "," + coord[1]];
                if (identifyFinishEvent) identifyFinishEvent(featureFromIdentify);
            } else {
                if ($.isEmptyObject(featureFromIdentify)) {
                    identifyNextGroupOnDownPage(groupIdx + 1, coord);
                } else {
                    layerDetailDIV.find(".BubleTable > tbody > tr").last().remove();
                    delete pixelFeatures[coord[0] + "," + coord[1]];
                    if (identifyFinishEvent) identifyFinishEvent(featureFromIdentify);
                }
            }
        }
    }

    this.fillFeatureIdentifyContent = function (layerInfo, features) {
        if (features.length == 0) return false;
        var serviceInfo = layerInfo.serviceInfo;
        var layerID = getLayerID(layerInfo);
        var layerContent = '<tr><th>' + layerInfo.name + '</th></tr>'
            + '<tr><td id="identity_' + $('<div/>').text(layerID).html() + '" ></td></tr>';
        layerDetailDIV.find(".BubleTable > tbody").children().last().before(layerContent);
        var $theContent = layerDetailDIV.find("#identity_" + layerID.replace(jQueryIDInvalidChar, "\\$1"));
        for (var i = 0; i < features.length; i++) {
            $theContent.append(me.genFeatureBubbleContent(layerInfo, features[i]));
            if (serviceInfo.identifyCallback) {
                serviceInfo.identifyCallback(features[i], $theContent);
            }
        }
        return true;
    }

    // 該圖層是否執行Identify
    function isLayerIdentifyable(layerInfo) {
        if ((!layerInfo.serviceInfo.bubbleContent || layerInfo.serviceInfo.bubbleContent == "") // 沒有bubble content
            && (!layerInfo.serviceInfo.identifyAllCallback && typeof (identifyAllCallback) == "function") // 沒有identifyCallback
        ) {
            return false;
        }
        return true;
    }

    var identifyEvent = function (evt) {
        // 別的左鍵功能正在使用中
        if (plugin.currentLeftClickFunc() != LEFT_CLICK_FUNC_LAYERS_MANAGER_IDENTIFY) {
            return;
        }

        if (identifyStartEvent) identifyStartEvent();
        //me.identify(evt.coordinate);
        //me.identifyLayersByGroup(evt.coordinate);
        //me.IdentifyPosition(evt.coordinate);
        me.identifyLayersByGroup(evt.coordinate);
    };

    /**
    * @summary
    * 啟用左鍵觸發identify的動作
    */
    this.activeIdentify = function () {
        plugin.activeLeftClickFunc(LEFT_CLICK_FUNC_LAYERS_MANAGER_IDENTIFY);
        map.on('singleclick', identifyEvent, me);
    };

    /**
    * @summary
    * 啟用左鍵觸發identify的動作
    */
    this.deactiveIdentify = function () {
        plugin.deactiveLeftClickFunc(LEFT_CLICK_FUNC_LAYERS_MANAGER_IDENTIFY);
        map.un('singleclick', identifyEvent, me);
    };

    /**
    * @summary 產生`feature`的bubble內容
    * @desc 依照ServiceInfo的bubbleContent產生圖徵內容
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {ol.Feature} feature - 圖徵
    * @return 圖徵的bubble內容(html)
    */
    this.genFeatureBubbleContent = function (layerInfoOrID, feature) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var strContent = layerInfo.serviceInfo.bubbleContent;
        if (!strContent) {
            strContent = '#AUTO#';
        }
        var userDefaultTemplate = strContent == '#AUTO#';
        var fieldNames = me.getShowingField(layerInfo, feature);
        if (userDefaultTemplate) {
            strContent = "<table class='List03' style='width:100%'>";
            for (var fname in fieldNames) {
                var value = feature.get(fname);
                if (typeof (value) == "object") {
                    continue;
                }
                strContent += "<tr><th>" + fieldNames[fname] + "</th><td style='overflow:hidden'>" + feature.get(fname) + "</td></tr>";
            }
            strContent += "</table><br/>";
        } else {
            strContent = plugin.genContentFromFeature(feature, strContent);
        }
        //strContent += '<br/><span class="BubleDetail"><a href="#">詳細資料</a></span>';
        return strContent;
    };

    /** 取得要顯示的欄位與順序
    * @func
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {ol.Feature|entity.FieldInfo[]} feature - 圖徵或欄位資訊陣列
    */
    this.getShowingField = function (layerInfoOrID, featureOrSchema) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var showingField = {};
        var shownField = {};
        var fieldMapping = layerInfo.fieldMapping || {};
        var fieldNames = [];
        if (ol.Feature.prototype.isPrototypeOf(featureOrSchema)) {
            fieldNames = featureOrSchema.getKeys();
        } else {
            for (var idx = 0; idx < featureOrSchema.length; idx++) {
                fieldnames[idx] = featureOrSchema[idx].name;
            }
        }
        if (layerInfo.fieldOrderBy) {
            if (fieldMapping) {
                for (var key in fieldMapping) {
                    shownField[key] = true;
                    if (fieldMapping[key] === false) {
                        continue;
                    }
                    else if (fieldMapping[key] === true) {
                        delete shownField[key];
                    } else {
                        showingField[key] = fieldMapping[key];
                    }
                }
            }
            fieldNames.forEach(function (fname) {
                if (!shownField[fname]) {
                    shownField[fname] = true;
                    showingField[fname] = fname;
                }
            });
        } else {
            fieldNames.forEach(function (fname) {
                if (fieldMapping[fname] === false) return;
                if (fieldMapping[fname] === undefined) {
                    showingField[fname] = fname;
                }
                else {
                    showingField[fname] = fieldMapping[fname];
                }
            });
        }
        return showingField;
    }

    var ajaxGetFeatureByID = null;
    /**
    * @summary [WFS][geoserver]以ID取得feature
    * @desc 此function同時只會有一個ajax在執行，如果上一個還未完成，則會先被強制結束
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {String} ID - feature ID in wfs
    * @param {function} _callback -
    *                   從wfs取得圖徵資訊後，將資訊存入ol.Feature, 傳給此function  
    *                   arg[0] 為圖徵 `ol.Feature`
    */
    this.getFeatureByID = function (layerInfoOrID, ID, _callback) {
        if (ajaxGetFeatureByID) ajaxGetFeatureByID.abort();
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var url = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var featureID = "";
        var featurePrefix = "";
        var layerID = serviceInfo.params.layer ? serviceInfo.params.layer : serviceInfo.params.layers;
        if (layerID.split(":").length > 1) {
            featurePrefix = layerID.split(":")[0];
        }
        if (ID.toString().indexOf(featurePrefix) == 0) {
            featureID = ID;
        } else {
            featureID = featurePrefix + "." + ID;
        }
        url += "?service=wfs&version=2.0.0&request=GetFeature"
            + "&typeNames=" + layerID + "&outputFormat=json"
            + "&srsName=" + serviceInfo.targetPrj
            + "&featureid=" + ID;
        if (serviceInfo.params.cql_filter) {
            url += "&cql_filter=" + encodeURIComponent(serviceInfo.params.cql_filter);
        }

        $.ajax(url, {
            context: { layerInfo: layerInfo }
            , beforeSend: function (jqXHR) { ajaxGetFeatureByID = jqXHR; }
        }).then(function (response, statusText, jqXHR) {
            ajaxGetFeatureByID = null;
            var respFormat = getRespFormat(response, jqXHR);
            var serviceInfo = this.layerInfo.serviceInfo;
            try {
                var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                _callback(features.length > 0 ? (features.length == 1 ? features[0] : features) : null);
            } catch (err) {
                if (console && console.error) {
                    console.error(err.stack);
                }
                _callback(null);
            }
        }, function () { ajaxGetFeatureByID = null; });
    };

    var ajaxGetFeatureByCoord = null;
    /**
    * @summary [WFS][geoserver]取得與指定坐標相交的features
    * @desc 此function同時只會有一個ajax在執行，如果上一個還未完成，則會先被強制結束
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {ol.Coordinate} coord - 坐標點位
    * @param {String|ol.proj.Projection} coordPrj - 坐標點位的坐標系統
    * @param {function} _callback -
    *                   從wfs取得圖徵資訊後，將資訊存入ol.Feature, 傳給此function  
    *                   arg[0] 為圖徵 `Array<ol.Feature>`
    */
    this.getFeatureByCoord = function (layerInfoOrID, coord, coordPrj, _callback) {
        if (ajaxGetFeatureByCoord) ajaxGetFeatureByCoord.abort();
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var url = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var featureID = "";
        var featurePrefix = "";
        var targetCoord;
        if (serviceInfo.srcPrj) {
            targetCoord = ol.proj.transform(coord, coordPrj, serviceInfo.srcPrj);
        } else {
            targetCoord = ol.proj.transform(coord, coordPrj, serviceInfo.targetPrj);
        }
        url += "?service=wfs&version=2.0.0&request=GetFeature"
            + "&typeNames=" + serviceInfo.params.layers + "&outputFormat=json"
            + "&srsName=" + serviceInfo.targetPrj;
        if (serviceInfo.params.cql_filter) {
            url += "&cql_filter=" + encodeURIComponent(serviceInfo.params.cql_filter + " and ");
        } else {
            url += "&cql_filter=";
        }
        url += "INTERSECTS(geometry, POINT(" + targetCoord.join(" ") + "))";

        $.ajax(url, {
            context: { layerInfo: layerInfo }
            , beforeSend: function (jqXHR) { ajaxGetFeatureByCoord = jqXHR; }
        }).then(function (response, statusText, jqXHR) {
            ajaxGetFeatureByCoord = null;
            var respFormat = getRespFormat(response, jqXHR);
            var serviceInfo = this.layerInfo.serviceInfo;
            try {
                var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                _callback(features);
            } catch (err) {
                if (console && console.error) {
                    console.error(err.stack);
                }
                _callback(null);
            }
        }, function () { ajaxGetFeatureByCoord = null; });
    };

    var ajaxGetFeatureByCqlFilter = null;
    /**
    * @summary [WFS][geoserver]以geoserver的cql_filter取得圖徵資訊
    * @desc 此function同時只會有一個ajax在執行，如果上一個還未完成，則會先被強制結束
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {String} cql_filter - cql filter format的過濾條件
    * @param {function} _callback -
    *                   從wfs取得圖徵資訊後，將資訊存入ol.Feature, 傳給此function  
    *                   arg[0] 為圖徵 `Array<ol.Feature>`
    * @param {boolean} allowMultiQuery - 是否允許多個
    * @return {jqXHR} ajax controller
    */
    this.getFeatureByCqlFilter = function (layerInfoOrID, cql_filter, _callback, allowMultiQuery) {
        if (ajaxGetFeatureByCqlFilter && !allowMultiQuery) ajaxGetFeatureByCqlFilter.abort();
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var url = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var featureID = "";
        var featurePrefix = "";
        url += "?service=wfs&version=2.0.0&request=GetFeature"
            + "&typeNames=" + serviceInfo.params.layers + "&outputFormat=json"
            + "&srsName=" + serviceInfo.targetPrj;
        if (serviceInfo.params.cql_filter) {
            url += "&cql_filter=" + encodeURIComponent(serviceInfo.params.cql_filter + " and ");
        } else {
            url += "&cql_filter=";
        }
        url += encodeURIComponent(cql_filter);

        return $.ajax(url, {
            context: { layerInfo: layerInfo }
            , beforeSend: function (jqXHR) { if (!allowMultiQuery) ajaxGetFeatureByCqlFilter = jqXHR; }
        }).then(function (response, status, jqXHR) {
            if (!allowMultiQuery) ajaxGetFeatureByCqlFilter = null;
            var respFormat = getRespFormat(response, jqXHR);
            var serviceInfo = this.layerInfo.serviceInfo;
            try {
                var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                _callback(features.length > 0 ? features : null);
            } catch (err) {
                if (console && console.error) {
                    console.error(err.stack);
                }
                _callback(null);
            }
        }, function () { if (!allowMultiQuery) ajaxGetFeatureByCqlFilter = null; });
    };

    var ajaxGetFeatureByFilter = null;
    /**
    * @summary [WFS][geoserver]以geoserver的filter參數取得圖徵資訊
    * @desc 此function同時只會有一個ajax在執行，如果上一個還未完成，則會先被強制結束  
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {String} filter - 請參考ogc filter encoding
    * @param {function} _callback -
    *                   從wfs取得圖徵資訊後，將資訊存入ol.Feature, 傳給此function  
    *                   arg[0] 為圖徵 `Array<ol.Feature>`
    */
    this.getFeatureByFilter = function (layerInfoOrID, filter, _callback) {
        if (ajaxGetFeatureByFilter) ajaxGetFeatureByFilter.abort();
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var url = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var featureID = "";
        var featurePrefix = "";
        url += "?service=wfs&version=2.0.0&request=GetFeature"
            + "&typeNames=" + serviceInfo.params.layers + "&outputFormat=json"
            + "&srsName=" + serviceInfo.targetPrj
            + "&filter=" + encodeURIComponent(filter);

        $.ajax(url, {
            context: { layerInfo: layerInfo }
            , beforeSend: function (jqXHR) { ajaxGetFeatureByFilter = jqXHR; }
        }).then(function (response, statusText, jqXHR) {
            ajaxGetFeatureByFilter = null;
            var respFormat = getRespFormat(response, jqXHR);
            var serviceInfo = this.layerInfo.serviceInfo;
            try {
                var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                _callback(features.length > 0 ? features : null);
            } catch (err) {
                if (console && console.error) {
                    console.error(err.stack);
                }
                _callback(null);
            }
        }, function () { ajaxGetFeatureByFilter = null; });
    };

    var ajaxGetFeatureByWFSReq = null;
    /**
    * @summary [WFS]以WFS xml request取得圖徵資訊
    * @desc 此function同時只會有一個ajax在執行，如果上一個還未完成，則會先被強制結束  
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {String} wfsXMLReq - 請參考ogc wfs GetFeature XML encoding
    * @param {function} _callback -
    *                   從wfs取得圖徵資訊後，將資訊存入ol.Feature, 傳給此function  
    *                   arg[0] 為圖徵 `Array<ol.Feature>`
    */
    this.getFeatureByWFSReq = function (layerInfoOrID, wfsXMLReq, _callback) {
        if (ajaxGetFeatureByWFSReq) ajaxGetFeatureByWFSReq.abort();
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var url = serviceInfo.wfsUrl ? serviceInfo.wfsUrl : serviceInfo.url;
        var featureID = "";
        var featurePrefix = "";
        url += "?service=wfs&typeNames=" + encodeURIComponent(serviceInfo.params.layer ? serviceInfo.params.layer : serviceInfo.params.layers)
            + "&srsName=" + encodeURIComponent(serviceInfo.targetPrj);

        $.ajax(url, {
            context: { layerInfo: layerInfo }
            , method: "POST"
            , data: wfsXMLReq
            , contentType: "text/xml;charset=UTF-8"
            , beforeSend: function (jqXHR) { ajaxGetFeatureByWFSReq = jqXHR; }
        }).then(function (response, statusText, jqXHR) {
            ajaxGetFeatureByWFSReq = null;
            try {
                var respFormat = getRespFormat(response, jqXHR);
                var serviceInfo = this.layerInfo.serviceInfo;
                var features = respFormat.readFeatures(response, { dataProjection: serviceInfo.targetPrj, featureProjection: map.getView().getProjection() });
                _callback(features.length > 0 ? features : null);
            } catch (err) {
                //if (console && console.error) {
                //    console.error(err.stack);
                //}
                _callback(response);
            }
        }, function () { ajaxGetFeatureByWFSReq = null; });
    };

    /**
    * @summary [WFS]取得圖層總筆數
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {function} _callback -
    *                   arg[0] 為總筆數 `int`
    */
    this.getFeatureCount = function (layerInfoOrID, _callback) {
        var layerInfo = me.getLayerInfo(layerInfoOrID);
        var serviceInfo = layerInfo.serviceInfo;
        var typeName = serviceInfo.params.layer ? serviceInfo.params.layer : serviceInfo.params.layers;
        var url = serviceInfo.url;
        var featureID = "";
        var featurePrefix = "";
        url += "?service=wfs&resultType=hits&request=GetFeature&version=1.1.0"
            + "&typeNames=" + encodeURIComponent(serviceInfo.params.layer ? serviceInfo.params.layer : serviceInfo.params.layers);
        if (serviceInfo.params.cql_filter) {
            url += "&cql_filter="
                + encodeURIComponent(serviceInfo.params.cql_filter);
        }
        $.ajax(url, {
            context: { layerInfo: layerInfo }
        }).then(function (data) {
            _callback(parseInt(data.documentElement.attributes["numberOfFeatures"].value));
        });
    }

    /**
    * @summary [WFS] 定位到指定的圖徵
    * @desc 此function同時只會有一個ajax在執行，如果上一個還未完成，則會先被強制結束
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {String} ID - feature ID in wfs
    */
    this.locateToFeature = function (layerInfoOrID, ID) {
        me.getFeatureByID(layerInfoOrID, ID, function (f) {
            if (f) {
                //var layerInfo = me.getLayerInfo(layerID);
                plugin.locateTool.locateToFeature(f, true);
            }
        });
    };

    /**
    * @summary 設定指定圖層的透明度
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @param {number} opacity - 
    *                 透明度  
    *                 如果值 <= 1，則當作透明度為0~1；  
    *                 如果值 > 1, 則當作透明度為0~100
    */
    this.setOpacity = function (layerInfoOrID, opacity) {
        if (opacity > 1) {
            opacity /= 100;
        }
        me.getLayer(layerInfoOrID).setOpacity(opacity);
    };

    /**
    * @summary 取得指定圖層的透明度
    * @param {LayerInfoOrID} layerInfoOrID - 指定圖層
    * @return {float} 透明度，值為0~1
    */
    this.getOpacity = function (layerInfoOrID) {
        return me.getLayer(layerInfoOrID).getOpacity();
    };

    var dragAndDropAddFeaturesHandler = null;
    var dragAndDropInteraction = new ol.interaction.DragAndDrop({
        formatConstructors: [
            ol.format.GeoJSON,
            ol.format.KML
        ]
    });

    /**
    * @summary 啟動圖台以拖拉的方式加入圖資
    * @param {function} addFeatureHandler - 請參考`ol.interaction.DragAndDrop`的addFeatures event
    */
    this.activeDragAndDrop = function (addFeatureHandler) {
        me.deactiveDragAndDrop();
        map.addInteraction(dragAndDropInteraction);
        dragAndDropAddFeaturesHandler = addFeatureHandler;
        dragAndDropInteraction.on('addfeatures', dragAndDropAddFeaturesHandler);
    };

    /**
    * @summary 停止圖台以拖拉的方式加入圖資的功能
    */
    this.deactiveDragAndDrop = function () {
        if (dragAndDropAddFeaturesHandler) {
            map.removeInteraction(dragAndDropInteraction);
            dragAndDropInteraction.un('addfeatures', dragAndDropAddFeaturesHandler);
            dragAndDropAddFeaturesHandler = null;
        }
    };

    // 判斷
    function getRespFormat(resp, jqXHR) {
        var contentType = jqXHR.getResponseHeader("content-type");
        var respFormat = new ol.format.GeoJSON();
        if (contentType.indexOf("text/xml") >= 0
            || (/gml/i).test(contentType)) {
            if (!resp || typeof (resp) == "string") {
                var parser = new DOMParser();
                resp = parser.parseFromString(resp || jqXHR.responseText, "text/xml");
            }
            var attrs = resp.documentElement.attributes;
            var gmlPrefix = "";
            if (resp) {
                for (var i = 0; i < attrs.length; i++) {
                    if (attrs[i].value == "http://www.opengis.net/gml") {
                        var charIdx = attrs[i].name.indexOf(":");
                        if (charIdx >= 0) {
                            gmlPrefix = attrs[i].name.substring(charIdx + 1);
                        }
                        break;
                    }
                }
            }
            var strSelector = "coordinates";
            if (gmlPrefix.length > 0) {
                strSelector += ", " + gmlPrefix + "\\:coordinates";
            }
            if ($(resp.documentElement).find(strSelector).filter(function () { return this.tagName.indexOf(gmlPrefix) == 0; }).length > 0) {
                respFormat = new ol.format.GML2();
            } else {
                respFormat = new ol.format.GML3();
            }
        }
        return respFormat;
    }

    // identify開始前，執行之
    this.onIdentifyStart = function (eventFunc) {
        identifyStartEvent = eventFunc;
    }

    // identify完成後，執行之
    this.onIdentifyFinish = function (eventFunc) {
        identifyFinishEvent = eventFunc;
    }

}

