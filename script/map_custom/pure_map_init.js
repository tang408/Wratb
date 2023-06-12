var baseLayerInfos = {};
var baseLayer;
var importSingleClickEventActive = false;
var mapPlugin = null;


// 初始化底圖
function initBaseLayers() {
    var projection = ol.proj.get('EPSG:3857');
    var projectionExtent = projection.getExtent();
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(14);
    var matrixIds = new Array(14);
    for (var z = 0; z < 19; ++z) {
        // generate resolutions and matrixIds arrays for this WMTS
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
    }

    // 國土測繪中心 -- 通用版電子地圖(套疊等高線)
    baseLayerInfos["電子地圖(含等高線)"] =
    {
        layer: new ol.layer.Tile({
            source: new ol.source.WMTS({
                url: "https://wmts.nlsc.gov.tw/wmts",
                layer: "EMAP5",
                matrixSet: 'GoogleMapsCompatible',
                format: 'image/png',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                })
            })
        }),
        display: false
    };
    switchBaseLayer("電子地圖(含等高線)");
}

// 初始化圖台
function mapInit() {

    var centerPosition = [0, 0];
    if (initPosition.length == 4) {
        centerPosition = [(initPosition[0] + initPosition[2]) / 2, (initPosition[1] + initPosition[3]) / 2];
    } else {
        centerPosition = initPosition;
    }

    // 比例尺線
    var scaleLineControl = new ol.control.ScaleLine({
        className: "tm-ol-scale-line"
    });

    var zoomControl = new ol.control.Zoom({
        className: "tm-ol-zoom"
    });

    map = new ol.Map({
        target: 'map',
        layers: [],
        logo: false,
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */({
                collapsible: false
            })
        }).extend([
            scaleLineControl
        ]),
        //interactions: ol.interaction.defaults().extend([modify]),
        view: new ol.View({
            center: ol.proj.transform(centerPosition, displayPrj, 'EPSG:3857'),
            zoom: initZoom,
            maxZoom: maxZoomLevel,
            minZoom: minZoomLevel
        })
    });

    var controls = map.getControls();
    for (var i = 0; i < controls.getLength(); i++) {
        if (ol.control.Zoom.prototype.isPrototypeOf(controls.item(i))) {
            //controls.item(i).setProperties("className", "tm-ol-zoom");
            map.removeControl(controls.item(i));
        }
    }
    map.addControl(zoomControl);


    if (initPosition.length == 4) {
        var displayExtent = ol.proj.transformExtent(initPosition, displayPrj, 'EPSG:3857');
        map.getView().fit(displayExtent, map.getSize());
    }

    // popup info setting
    popupElement = document.getElementById('popup');
    popupOverlay = new ol.Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        autoPan: true,
        autoPanAnimation: {
            duration: 100
        }
    });
    map.addOverlay(popupOverlay);

    // control for coordinates presentation
    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: function (coordinate) {
            var ret = ol.coordinate.format(coordinate, coordinateTemplate, 0);
            return ret;
        },
        projection: displayPrj,
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    map.addControl(mousePositionControl);


    mapPlugin = new oltmx.Plugin(map,
        {
            actives: [
                { id: "Locate" },
                { id: "LayersMg", params: { mapLayers: map_layers }}
            ],
            displayPrj: displayPrj
        }
    );

    // 初始化底圖
    initBaseLayers();

   // parent.call();

    if (parent) {
        try {
            parent.mapPlugin = mapPlugin;
          
            parent.SetLights();
        } catch (err) {

        }
    }

    // 斜坡觀測開啟斜坡方向圖層
    if (parent.iTag == 3) {
        mapPlugin.layersMg.switchTheLayer("slope_direction");
    }
}

function round(num, digit) {
    return Math.round(num * Math.pow(10, digit)) / Math.pow(10, digit);
}

// 開關底圖
function switchBaseLayer(layerName) {
    var theLayer = baseLayerInfos[layerName];
    if (theLayer == null) {
        alert("此圖層尚未介接完成或其圖資提供單位無法正常提供服務");
        return false;
    }
    for (var key in baseLayerInfos) {
        var tmpLayer = baseLayerInfos[key];
        // set index of layer
        //map.getLayers().setAt(99, tmpLayer);
    }
    if (theLayer.display) {
        mapPlugin.getBaseLayerGroup().getLayers().remove(baseLayerInfos[layerName].layer);
    } else {
        mapPlugin.getBaseLayerGroup().getLayers().push(baseLayerInfos[layerName].layer);
    }
    theLayer.display = !theLayer.display;
    return true;
}

function getBaseLayerOpacity(layerName) {
    return baseLayerInfos[layerName].layer.getOpacity();
}

function setBaseLayerOpacity(layerName, opacity) {
    var theLayer = baseLayerInfos[layerName].layer;
    if (theLayer == null) {
        return false;
    }
    if (opacity > 1) {
        opacity /= 100;
    }
    theLayer.setOpacity(opacity);
}

function changeBaseLayerPostion(layerName, targetPos) {
    var theLayer = baseLayerInfos[layerName];
    if (theLayer == null) {
        console.log("changeBaseLayerPostion(layerName, targetPos) -- 找不到此圖層[" + layerName + "]");
        return;
    }
    var layers = mapPlugin.getBaseLayerGroup().getLayers();
    layers.remove(baseLayerInfos[layerName].layer);
    layers.insertAt(layers.getArray().length - targetPos, baseLayerInfos[layerName].layer);
}


function getLayerInfo(path) {
    return eval("map_layers" + path);
}