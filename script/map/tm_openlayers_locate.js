/*
* class : oltmx.util.Locate
* 圖台定位工具
*/

oltmx.util.Locate = function (mapPlugin) {
    var plugin = mapPlugin;
    var map = plugin.getMap();
    var layerSource = new ol.source.Vector();
    var layer = new ol.layer.Vector({
        source: layerSource,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [10, 32],
                anchorXUnits: 'pixels',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: "./App_Themes/Map/images/location.png"
            }),
            stroke: new ol.style.Stroke({
                color: "rgba(32,32,255,0.8)",
                width: 3
            }),
            fill: new ol.style.Fill({
                color: "rgba(128,128,255,0.2)"
            })
        })
    });
    map.addLayer(layer);

    var createLabelStyle = function (text) {
        var styles = [
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [10, 32],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 0,
                    src: "./App_Themes/Map/images/location.png"
                }),
                text: new ol.style.Text({
                    text: text,
                    scale: 1.1,
                    fill: new ol.style.Fill({
                        color: '#FFFFFF'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#000000',
                        width: 5
                    }),
                    font: 'bold 25px 微軟正黑體,sans-serif',
                    offsetY: 15
                })
            })
        ];
        return styles;
    }

    /**
    * @summary 回傳定位圖徵使用的layer
    * @return {ol.Layer} 定位圖徵使用的layer
    * @protected
    */
    this.getLayer = function () {
        return layer;
    };

    var me = this;
    // 依照WKT定位，並放入定位圖徵
    this.locateToWKT = function (sWKT, srcPrj, bShowFeature, text) {
        var ret = {
            extent: null
        };
        var wkt = new ol.format.WKT();
        var extent = ol.extent.createEmpty();
        var geom;

        // TODO 這會移除array，後面多WKT的判斷就會無效
        if ($.isArray(sWKT) && sWKT.length == 1) {
            sWKT = sWKT[0];
        }
        var mapPrj = map.getView().getProjection();
        me.clearLocatedFeature();
        if ($.isArray(sWKT)) {
            var geom = new ol.geom.GeometryCollection();
            var arGeom = [];
            for (var i = 0; i < sWKT.length; i++) {
                var feature = wkt.readFeature(sWKT[i], { dataProjection: srcPrj, featureProjection: mapPrj });
                if (bShowFeature) {
                    layerSource.addFeature(feature);
                }
                arGeom.push(feature.getGeometry());
            }
            geom.setGeometries(arGeom);
            extent = geom.getExtent();
            ret.extent = extent;
            map.getView().fit(extent, map.getSize());
            map.getView().setZoom(map.getView().getZoom() - 1);
        } else {
            var feature = wkt.readFeature(sWKT, { dataProjection: srcPrj, featureProjection: mapPrj });
            var labelPoint = createLabelFeature(feature);
            labelPoint.setStyle(createLabelStyle(text));
            if (feature.getGeometry().getType() == 'Point') {
                labelPoint.getStyle()[0].getImage().setOpacity(0.75);
            }
            me.locateToFeature(feature, bShowFeature);
            layerSource.addFeature(labelPoint);
            ret.extent = feature.getGeometry().getExtent();
        }
        return ret;
    }

    // 依照點坐標定位
    // coord : 為array，length == 2
    // srcPrj : coord的坐標系統
    this.locateToCoord = function (coord, srcPrj, bShowFeature, text) {
        var targetCoord = coord;
        if (srcPrj) {
            targetCoord = ol.proj.transform(coord, srcPrj, map.getView().getProjection());
        }
        if (bShowFeature) {
            this.clearLocatedFeature();
            var feature = new ol.Feature({ geometry: new ol.geom.Point(targetCoord) });
            feature.setStyle(createLabelStyle(text));
            feature.getStyle()[0].getImage().setOpacity(1);
            feature.getStyle()[0].getText().setScale(0.8);
            feature.getStyle()[0].getText().getStroke().setWidth(6.5);
            layerSource.addFeature(feature);
        }
        map.getView().setZoom(locatingPointZoom);
        map.getView().setCenter(targetCoord);
    }

    this.locateToGeom = function (_geom, srcPrj, bShowFeature, text) {
        var feature = null;
        var extent = null;
        me.clearLocatedFeature();
        var mapPrj = map.getView().getProjection();
        if ($.isArray(_geom)) {
            var geom = null;
            feature = [];
            for (var i = 0; i < _geom.length; i++) {
                if (srcPrj) {
                    geom = _geom[i].transform(srcPrj, mapPrj);
                } else {
                    geom = _geom[i];
                }
                feature[i] = new ol.Feature({ geometry: geom });
            }
            var labelPoint = createLabelFeature(feature);
            if (labelPoint.length > 0) {
                for (var i = 0; i < labelPoint.length; i++) {
                    labelPoint[i].setStyle(createLabelStyle(text));
                    if (geom.getType() == 'Point') {
                        labelPoint[i].getStyle()[0].getImage().setOpacity(0.75);
                    }
                    layerSource.addFeature(labelPoint[i]);
                }
                me.locateToFeature(feature, bShowFeature);
            }
        } else {
            if (srcPrj) {
                geom = _geom.transform(srcPrj, mapPrj);
            }
            else {
                geom = _geom;
            }
            var feature = new ol.Feature({ geometry: geom });
            var labelPoint = createLabelFeature(feature);
            labelPoint.setStyle(createLabelStyle(text));
            if (geom.getType() == 'Point') {
                labelPoint.getStyle()[0].getImage().setOpacity(0.75);
            }
            me.locateToFeature(feature, bShowFeature);
            layerSource.addFeature(labelPoint);
        }
    }

    this.locateToGML = function (_gml, bShowFeature, text) {
        var features = oltmx.format.gml.readFeatures(_gml);
        var labelPoint = createLabelFeature(feature);
        labelPoint.setStyle(createLabelStyle(text));
        if (feature.getGeometry().getType() == 'Point') {
            labelPoint.getStyle()[0].getImage().setOpacity(0.75);
        }
        me.locateToFeature(features, bShowFeature);
        layerSource.addFeature(labelPoint);
    }

    this.locateToFeature = function (_feature, bShowFeature) {
        var extent = null;
        var mapView = map.getView();
        if ($.isArray(_feature)) {
            geom = [];
            layerSource.clear();
            _feature.forEach(function (f) {
                var geom = null;
                var feature = f.clone();
                geom = feature.getGeometry();
                if (bShowFeature) {
                    layerSource.addFeature(feature);
                }
                extent = extent == null ? geom.getExtent() : ol.extent.extend(extent, geom.getExtent());
            });
            if (extent) {
                map.getView().fit(extent, map.getSize());
                mapView.setZoom(mapView.getZoom() - 1);
            }
        } else {
            var feature = _feature.clone();
            var geom = feature.getGeometry();
            if (bShowFeature) {
                layerSource.clear();
                layerSource.addFeature(feature);
            }
            if (geom && ol.geom.Point.prototype.isPrototypeOf(geom)) {
                map.getView().setCenter(geom.getCoordinates());
                mapView.setZoom(locatingPointZoom);
            } else {
                map.getView().fit(geom.getExtent(), map.getSize());
                mapView.setZoom(mapView.getZoom() - 1);
            }
        }
    }

    this.zoomToLayer = function (layer) {
        me.zoomToExtent(layer.getSource().getExtent());
    }

    this.zoomToExtent = function (extent, srcPrj) {
        if (srcPrj) {
            extent = ol.proj.transformExtent(extent, srcPrj, map.getView().getProjection());
        }
        map.getView().fit(extent, map.getSize());
    }

    this.clearLocatedFeature = function () {
        layerSource.clear();
    }
};

// 找出MultiPolygon中面積最大的Polygon
function getMaxPoly(polys) {
    var polyObj = [];

    for (var b = 0; b < polys.length; b++) {
        polyObj.push({ poly: polys[b], area: polys[b].getArea() });
    }

    polyObj.sort(function (a, b) { return a.area - b.area });

    return polyObj[polyObj.length - 1].poly;
}

// 判斷feature的型別，設置Label要呈現的點位
function createLabelFeature(feature) {
    var isArray = true;
    var featureArray = new Array();
    if (!$.isArray(feature)) {
        isArray = false;
        featureArray[0] = feature;
    }
    else {
        featureArray = feature;
    }

    var point = new Array();
    for (var i = 0; i < featureArray.length; i++) {
        var labelPoint;
        var type = featureArray[i].getGeometry().getType();
        if (type === 'MultiPolygon') {
            labelPoint = getMaxPoly(featureArray[i].getGeometry().getPolygons()).getInteriorPoint();
        } else if (type === 'Polygon') {
            labelPoint = featureArray[i].getGeometry().getInteriorPoint();
        } else if (type === 'LineString') {
            var centerCoord = featureArray[i].getGeometry().getCoordinateAt(0.5);
            labelPoint = new ol.geom.Point(centerCoord);
        } else if (type === 'Point') {
            labelPoint = featureArray[i].getGeometry();
        }
        point[i] = new ol.Feature(labelPoint);
    }

    if (isArray)
        return point;
    else
        return point[0];
}
