/*
*===============================================================================
* namespace : oltmx.editor
*  圖資編輯工具
*===============================================================================
*/
oltmx.editor = {};

/*
* class : 
* 
*/
oltmx.editor.Editor = function (_mapPlugin) {
    var LEFT_CLICK_FUNC_EDITOR_EDITING = "editor_editing";
    var plugin = _mapPlugin;
    var map = plugin.getMap();
    var isEditing = false;
    var me = this;

    // modifying features
    if (!plugin.layersMg) {
        throw new Error("啟動EditorTool之前，必須先啟動LayersManager");
    }

    // 編輯中的圖層ID
    var targetLayerID = null;
    // 編輯中LayerInfo
    var editingLayerInfo = null;

    // 需要被選擇的feature id，等feature load到圖層後，再被選擇
    var selectingFeatureID = null;

    // 被異動的feature的clone
    var oriFeatures = {};
    var insertedFeatrues = new ol.Collection();
    var insertedKeys = {};
    var updatedFeatrues = new ol.Collection();
    var updatedKeys = {};
    var deletedFeatures = new ol.Collection();
    var deletedKeys = {};

    var mdfFeatures = new ol.Collection();

    // 選擇與異動的style
    var mdfStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0, 0, 255, 0.2]
        }),
        stroke: new ol.style.Stroke({
            color: [0, 0, 255],
            width: 5
        }),
        image: new ol.style.RegularShape({
            radius: 10,
            fill: new ol.style.Fill({
                color: [0, 153, 255, 0]
            }),
            points: 4,
            stroke: new ol.style.Stroke({
                color: [0, 0, 255, 0.75],
                width: 2
            })
        }),
        zIndex: 100000
    });

    var mdfNonPointStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [0, 0, 255, 0.2]
        }),
        stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0.5],
            width: 5
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: [0, 153, 255, 0]
            }),
            stroke: new ol.style.Stroke({
                color: [0, 0, 255, 1],
                width: 2
            })
        }),
        zIndex: 100000
    });


    var modify = null;
    var select = null;


    // 是否自動儲存feature，不含刪除
    this.isAutoSave = true;

    // 開始編輯layer，必須停止編輯後，才可以再開始新的編輯
    this.startEditing = function (layerInfo) {
        if (isEditing) return;
        isEditing = true;
        plugin.activeLeftClickFunc(LEFT_CLICK_FUNC_EDITOR_EDITING);
        try {
            editingLayerInfo = layerInfo;
            targetLayerID = layerInfo.layerID;
            // select interaction
            select = new ol.interaction.Select({
                // 被選的圖示為原圖示+異動的圖示
                style: [plugin.layersMg.getLayer(layerInfo).getStyle(), layerInfo.geometryType.toLowerCase() == "point" ? mdfStyle : mdfNonPointStyle],
                layers: function (layer) {
                    // 限定可select的layer
                    return layer.get('layerID') == targetLayerID;
                }
            });
            map.addInteraction(select);
            var features = select.getFeatures();
            // 當feature被select到時
            features.on('add', featureAdded);
            features.on('remove', featureRemoved);
            modify = new ol.interaction.Modify({
                features: features,
                style: layerInfo.geometryType.toLowerCase() == "point" ? mdfStyle : mdfNonPointStyle
            });
            map.addInteraction(modify);
            // 使用snap會比較好點擊到圖徵
            var snap = new ol.interaction.Snap({
                source: plugin.layersMg.getLayer(layerInfo).getSource()
            });
            map.addInteraction(snap);

            // 當mouse up時，儲存feature到server
            $(map.getViewport()).on('mouseup', editingMouseUp_MapView);

        } catch (e) {
            try {
                me.stopEditing();
            } catch (ee) {
            }
            console.error(e.stack);
        }
    }

    // 清除所有被選取的圖徵
    this.clearSelected = function () {
        if (select) {
            select.getFeatures().clear();
        }
    }

    var drawInteraction = null;

    // 啟動新增feature模式
    this.addingFeature = function () {
        if (!editingLayerInfo) throw new Error("使用addFeature前，必須先startEditing");
        if (drawInteraction) map.removeInteraction(drawInteraction);
        drawInteraction = null;
        var serviceInfo = editingLayerInfo.serviceInfo;
        switch (editingLayerInfo.geometryType.toLowerCase()) {
            case "point":
                drawInteraction = new ol.interaction.Draw({
                    source: mapPlugin.layersMg.getLayer(editingLayerInfo).getSource(),
                    type: 'Point',
                    style: mapPlugin.layersMg.getLayer(editingLayerInfo).getStyle()
                });
                break;
            case "polyline":
                drawInteraction = new ol.interaction.Draw({
                    source: mapPlugin.layersMg.getLayer(editingLayerInfo).getSource(),
                    type: 'LineString',
                    style: new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 5,
                            fill: new ol.style.Fill({ color: "#ffcc33" })
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgb(0, 0, 255)",
                            width: 2
                        })
                    })
                });
                break;
            case "polygon":
                drawInteraction = new ol.interaction.Draw({
                    source: mapPlugin.layersMg.getLayer(editingLayerInfo).getSource(),
                    type: 'Polygon',
                    style: new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 5,
                            fill: new ol.style.Fill({ color: "#ffcc33" })
                        }),
                        stroke: new ol.style.Stroke({
                            color: "rgb(0, 0, 255)",
                            width: 2
                        }),
                        fill: new ol.style.Stroke({
                            color: "rgba(0, 0, 125, 0.2)"
                        })
                    })
                });
                break;
        }
        drawInteraction.on('drawend',
                function (evt) {
                    map.removeInteraction(drawInteraction);
                    //console.log("新增圖資");
                    var newFeature = evt.feature;
                    insertedFeatrues.push(newFeature);
                    mapPlugin.layersMg.getLayerSchema(editingLayerInfo, function (schema) {
                        // 先設定schema
                        var props = {};
                        schema.forEach(function (field) {
                            if (field.dataType == "geometry") {
                                newFeature.setGeometryName(field.name);
                            } else {
                                switch (field.dataType) {
                                    case "xsd:string":
                                        newFeature.set(field.name, "");
                                        break;
                                    case "xsd:decimal":
                                    case "xsd:integer":
                                    case "xsd:int":
                                    case "xsd:long":
                                    case "xsd:short":
                                        newFeature.set(field.name, 0);
                                        break;
                                    case "xs:date":
                                        // TODO
                                        newFeature.set(field.name, "");
                                        break;
                                }
                            }
                        });
                        // 再儲存到server
                        me.saveFeatures({
                            success: function () {
                                select.getFeatures().clear();
                                select.getFeatures().push(newFeature);
                            },
                            error: function () {
                                map.addInteraction(drawInteraction);
                            }
                        });
                    });

                    //me.saveFeatures({
                    //    success: function () {
                    //        // 設定新feature的schema
                    //        mapPlugin.layersMg.getLayerSchema(editingLayerInfo, function (schema) {
                    //            map.removeInteraction(drawInteraction);
                    //            schema.forEach(function (field) {
                    //                if (field.dataType == "geometry") {
                    //                    newFeature.setGeometryName(field.name);
                    //                } else {
                    //                    newFeature.set(field.name, "");
                    //                }
                    //            });
                    //            select.getFeatures().clear();
                    //            select.getFeatures().push(newFeature);
                    //        });
                    //    }
                    //});
                });
        map.addInteraction(drawInteraction);
    }

    // 選擇指定的圖徵
    this.selectFeature = function (featureID, extent) {
        var bSelected = false;
        var layerSource = plugin.layersMg.getLayer(editingLayerInfo).getSource();

        select.getFeatures().clear();
        // 如果要被選擇的feature已經在source裡
        layerSource.getFeatures().forEach(
            function (f) {
                if (f.getId() == featureID) {
                    select.getFeatures().push(f);
                    bSelected = true;
                    var featureExtent = f.getGeometry().getExtent();
                    if (ol.extent.containsExtent(mapPlugin.get2DExtent(), featureExtent)) {
                        mapPlugin.locateTool.locateToCoord(ol.extent.getCenter(featureExtent));
                    } else {
                        mapPlugin.locateTool.locateToFeature(f);
                    }
                }
            }
        );

        // 如果要被選擇的feature不在source裡
        if (!bSelected) {
            // 定位到該feature的位置，等待feature被load進來，再選擇
            var onSelected = function (evt) {
                if (evt.feature.getId() == featureID) {
                    select.getFeatures().push(evt.feature);
                    bSelected = true;
                    layerSource.un('addfeature', onSelected);
                }
            };
            layerSource.on('addfeature', onSelected);
            mapPlugin.locateTool.zoomToExtent(extent);
        }
    }

    this.onSelectFeature = null;

    // 停止編輯
    this.stopEditing = function () {
        $(map.getViewport()).off('mouseup', editingMouseUp_MapView);
        if (select) {
            var features = select.getFeatures();
            features.un('add', featureAdded);
            features.un('remove', featureRemoved);
            map.removeInteraction(select);
        }
        map.removeInteraction(modify);
        isEditing = false;
        modify = null;
        //map.removeInteraction(select);
        targetLayerID = null;
        $(document).off('keyup', deleteSelectedFeature);
        plugin.deactiveLeftClickFunc(LEFT_CLICK_FUNC_EDITOR_EDITING);
    }

    // 是否在編輯中
    this.getIsEditing = function () {
        return isEditing;
    }

    var isDeleting = false;
    var deleteSelectedFeature = function () {
        if (event.keyCode != 46) {
            return;
        }
        if (isDeleting) return;
        isDeleting = true;
        $(document).off('keyup', deleteSelectedFeature);
        if (select.getFeatures().getArray().length > 0 && confirm("您確定要刪除嗎?")) {
            // remove all selected features from select_interaction and my_vectorlayer
            select.getFeatures().forEach(function (selected_feature) {
                deletedFeatures.push(selected_feature);
                deletedKeys[selected_feature.getId()] = 1;
            });
            // 刪除server資料
            me.saveFeatures({
                success: function () {
                    var editingLayer = mapPlugin.layersMg.getLayer(editingLayerInfo);
                    select.getFeatures().getArray().forEach(function (selected_feature) {
                        select.getFeatures().remove(selected_feature);
                        editingLayer.getSource().removeFeature(selected_feature);
                    });
                    isDeleting = false;
                },
                error: function () {
                    $(document).on('keyup', deleteSelectedFeature);
                    isDeleting = false;
                }
            });
        } else {
            $(document).on('keyup', deleteSelectedFeature);
            isDeleting = false;
        }
    }

    // 給ol.Feature instance或feature id，來刪除feature
    this.deleteFeature = function (feature) {
        if (typeof (feature) != "object") {
            var tmp = null;
            var source = plugin.layersMg.getLayer(editingLayerInfo).getSource();
            tmp = source.getFeatureById(feature);
            if (tmp == null) {
                tmp = new ol.Feature();
                tmp.setId(feature);
            } else {
                source.removeFeature(tmp);
            }
            feature = tmp;
        }
        deletedFeatures.push(feature);
        deletedKeys[feature.getId()] = 1;
    }

    var editingMouseUp_MapView = function (evt) {
        if (me.isAutoSave)
            me.saveFeatures();
    }

    // 當加入Feature
    var featureAdded = function (evt) {
        // grab the feature
        var feature = evt.element;
        // 備份feature的資料
        oriFeatures[feature.getId()] = feature.clone();
        // 當feature被修改時
        feature.on('change', featureModified);
        feature.on('propertychange', featureModified);
        // 當按了delete鍵時
        $(document).on('keyup', deleteSelectedFeature);
        if (me.onSelectFeature) {
            me.onSelectFeature(feature);
        }
    }

    // 當feature被移除
    var featureRemoved = function (evt) {
        // grab the feature
        var feature = evt.element;
        feature.un('change', featureModified);
        feature.un('propertychange', featureModified);
    }

    // feature異動結束後
    var featureModified = function (e) {
        if (updatedKeys[this.getId()] || insertedFeatrues[this.getId()]) return;
        updatedKeys[this.getId()] = 1;
        updatedFeatrues.push(this);
    }

    var saveFeaturesLock = false;
    this.saveFeatures = function (option) {
        if (insertedFeatrues.getArray().length == 0
            && updatedFeatrues.getArray().length == 0
            && deletedFeatures.getArray().length == 0
            ) {
            return;
        }

        if (saveFeaturesLock) return;
        saveFeaturesLock = true;

        var serviceInfo = editingLayerInfo.serviceInfo;

        var wfsFormat = new ol.format.WFS({
            featureNS: serviceInfo.featureNS,
            featureType: serviceInfo.featureType
        });
        var transactionOption = {
            // namespace
            featureNS: serviceInfo.featureNS,
            // feature type (layer id of wfs)
            featureType: serviceInfo.featureType,
            // projection
            srsName: map.getView().getProjection().getCode(),
            gmlOptions: {
                // namespace
                featureNS: serviceInfo.featureNS,
                // feature type (layer id of wfs)
                featureType: serviceInfo.featureType,
                // projection
                srsName: map.getView().getProjection().getCode()
            }
        };

        // 產製wfs transation request xml
        var transactionXML
            = wfsFormat.writeTransaction(
                            insertedFeatrues.getArray(),
                            updatedFeatrues.getArray(),
                            deletedFeatures.getArray(),
                            transactionOption);
        //console.log(transactionXML);

        // IE9 會移除不需要namespace宣告，手動加入
        var strXMl = new XMLSerializer().serializeToString(transactionXML);
        strXMl = strXMl.replace("<Transaction", "<Transaction xmlns:feature=\"" + serviceInfo.featureNS + "\"");

        $.ajax({
            url: serviceInfo.url + "?service=wfs",
            method: "POST",
            contentType: "text/xml",
            data: strXMl,
            //processData: false,
            success: function () {
                saveFeaturesLock = false;
                if (arguments[2].getResponseHeader("content-type").indexOf("/xml") > -1) {
                    //console.log(arguments[0].firstChild.innerHTML);
                    var $xml = $(arguments[0].documentElement);
                    if ($xml.find("ExceptionReport, ows\\:ExceptionReport").length > 0) {
                        alert("更新失敗 \n" + $xml.find("ExceptionText, ows\\:ExceptionText").text());
                    } else {
                        var fids = $xml.find("InsertResults, wfs\\:InsertResults").find("FeatureId, ogc\\:FeatureId");
                        for (var i = 0; i < insertedFeatrues.getLength() && i < fids.length; i++) {
                            insertedFeatrues.item(i).setId($(fids[i]).attr("fid"));
                        }
                        if (option && option.success) {
                            try {
                                option.success();
                            } catch (e) {
                                console.error(e.stack);
                            }
                        }
                        clearUpdatedFeatures();
                    }
                } else {
                    console.log(arguments[0]);
                }
            },
            error: function () {
                saveFeaturesLock = false;
                try {
                    if (option && option.error)
                        option.error(arguments);
                } catch (e) { }
                console.log($(arguments[0]).text());
            }
        }).done(function () {
        });
    };

    function clearUpdatedFeatures() {
        insertedFeatrues.clear();
        updatedFeatrues.clear();
        deletedFeatures.clear();
        insertedKeys = {};
        updatedKeys = {};
        deletedKeys = {};
        oriFeatures = {};
    }

    var layerInfos = {};
    var layers = {};
    var editFeatures = [];
    function createLayerEditor(_layerInfo) {
        if (layerInfos[_layerInfo.layerID]) layerInfos[_layerInfo.layerID];
        layerInfos[_layerInfo.layerID] = _layerInfo;
        layers[_layerInfo.layerID] = new oltmx.editor.LayerEditor(this, _layerInfo.layer);
        return layers[_layerInfo.layerID];
    }

    this.getLayerEditor = function (layerID) {
        return layers[layerID];
    }

    this.editFeature = function (_layerInfo, featureID) {
        var layerEditor = createLayerEditor(_layerInfo);
        var featureEditor = layerEditor.editFeatureById(featureID);
        mdfFeatures.push(featureEditor.getFeature());
    }

    this.stopEdit = function (_layerInfo, featureID) {

    }
}

oltmx.editor.LayerEditor = function (_editor, _layer) {
    this.editor = _editor;
    var layer = _layer;
    var minNewFeatureID = -1;

    this.addFeature = function (_geom, _srcPrj, _bMoveMap) {
        var geom = oltmx.util.Tools.toMapGeom(this.editor.map, _geom.clone(), _srcPrj);
        var newFeatureID = minNewFeatureID--;
        var feature = new ol.Feature();
        feature.setId(newFeatureID);
        layer.getSource().addFeature(feature);
        new oltmx.editor.FeatureEditor(this, feature).setGeometry(geom, null, _bMoveMap);
        return feature;
    }

    this.editFeatureById = function (featureID) {
        return this.editFeature(layer.getSource().getFeatureById(featureID));
    }

    this.editFeature = function (feature) {
        return new oltmx.editor.FeatureEditor(this, feature);
    }

    this.removeFeature = function (feature) {
        var source = layer.getSource();
        source.removeFeature(feature);
        delete newFeatures[feature.getId()];
    }

    this.save = function () {
    }
}

oltmx.editor.FeatureEditor = function (_layerEditor, _feature) {
    var layerEditor = _layerEditor;
    var feature = _feature;
    var oriCoordinates = null;
    var oriProperties = null;
    var bSaved = _feature.getId() > 0;
    var bDeleted = false;
    this.remove = function () {
        layerEditor.removeFeature(this);
        bDeleted = true;
    }
    this.getFeature = function () {
        if (bDeleted) throw new Error("此Feature已經刪除");
        return feature;
    }
    this.setGeometry = function (_geom, _srcPrj, _bMoveMap) {
        if (bDeleted) throw new Error("此Feature已經刪除");
        var view = layerEditor.editor.map.getView();
        var geom = _geom;
        if (_srcPrj) {
            geom = _geom.clone().transform(_srcPrj, view.getProjection());
        }
        feature.setGeometry(geom);
        if (_bMoveMap)
            view.setCenter(ol.extent.getCenter(geom.getExtent()));
    }
    this.cancel = function () {
        if (bDeleted) throw new Error("此Feature已經刪除");
        if (!bSaved) this.remove();
        else {
            // TODO 回復到編輯前狀態
        }
        bDeleted = true;
    }
    this.save = function () {
        if (bDeleted) throw new Error("此Feature已經刪除");
        return true;
    }
}