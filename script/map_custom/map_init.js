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

    // 國土測繪中心 -- 正射影像圖(通用版)
    baseLayerInfos["正射(航照)地圖"] = {
        layer: new ol.layer.Tile({
            source: new ol.source.WMTS({
                url: "https://wmts.nlsc.gov.tw/wmts",
                layer: "PHOTO2",
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

    // 國土測繪中心 -- 正射影像圖(通用版)
    //baseLayerInfos["電子地圖(僅道路)"] = {
    //    layer: new ol.layer.Tile({
    //        source: new ol.source.WMTS({
    //            url: "http://wmts.nlsc.gov.tw/wmts",
    //            layer: "EMAP2",
    //            matrixSet: 'GoogleMapsCompatible',
    //            format: 'image/png',
    //            projection: projection,
    //            tileGrid: new ol.tilegrid.WMTS({
    //                origin: ol.extent.getTopLeft(projectionExtent),
    //                resolutions: resolutions,
    //                matrixIds: matrixIds
    //            })
    //        })
    //    }),
    //    display: false
    //};


    // 透過wmts的Capabilities取得連線方式
    // TGOS WMTS 需使用RESTful，透過kvp會失敗
    var parser = new ol.format.WMTSCapabilities();
    $.ajax('https://gis.sinica.edu.tw/tgos/wmts').then(function (response) {
        var result = parser.read(response);
        var options = ol.source.WMTS.optionsFromCapabilities(result,
              { layer: 'TGOSMAP_W', matrixSet: 'GoogleMapsCompatible', requestEncoding: "RESTful" });
        // TGOS電子地圖
        baseLayerInfos["電子地圖"] = {
            layer: new ol.layer.Tile({
                source: new ol.source.WMTS(options)
            }),
            display: false
        };

        // 通用版電子地圖 NLSCMAP_W ??
    });


    $.ajax('https://gis.sinica.edu.tw/tgos/wmts').then(function (response) {
        var result = parser.read(response);
        var options = ol.source.WMTS.optionsFromCapabilities(result,
              { layer: 'ROADMAP_W', matrixSet: 'GoogleMapsCompatible', requestEncoding: "RESTful" });
        baseLayerInfos["福衛二號混合圖"] = {
            layer: new ol.layer.Tile({
                source: new ol.source.WMTS(options)
            }),
            opacity: 1,
            display: false
        };
    });

    //$.ajax('http://gis.sinica.edu.tw/tgos/wmts').then(function (response) {
    //    var result = parser.read(response);
    //    var options = ol.source.WMTS.optionsFromCapabilities(result,
    //          { layer: 'HILLSHADEMIX_W', matrixSet: 'GoogleMapsCompatible', requestEncoding: "RESTful" });
    //    baseLayerInfos["地形暈渲混合圖"] = {
    //        layer: new ol.layer.Tile({
    //            source: new ol.source.WMTS(options)
    //        }),
    //        display: false
    //    };
    //});
}

// 初始化圖台
function mapInit() {

    // layer group for base map
    //baseLayer = new ol.layer.Group();
    // layer group for upper base map

    // 初始化功能
    initFunctions();

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
        renderer: 'dom',
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

    $menuElement = $("#menu")[0];
    $menuContent = $("#menu-content");
    ovMenu = new ol.Overlay({
        element: $menuElement,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        },
        offset: [0, 32]
    });

    $(map.getViewport()).on('contextmenu', function (e) {
        e.preventDefault();
        ovMenu.setMap(null);
        var coord = map.getEventCoordinate(e);
        var latlon = ol.proj.transform(coord, "EPSG:3857", "EPSG:4326");
        var twd97 = ol.proj.transform(coord, "EPSG:3857", "EPSG:3826");
        var twd67 = ol.proj.transform(coord, "EPSG:3857", "EPSG:3828");
        $menuContent.children().remove();
        $("<p>坐標系統</p>").appendTo($menuContent);
        $("<ul/>").appendTo($menuContent);
        $('<li><a>WGS84(10進位) </a><span class="CoordinateTxt">' + round(latlon[1], 4) + ", " + round(latlon[0], 4) + '</span></li>').appendTo($menuContent.find("ul"));
        $('<li><a>WGS84(度分秒) </a><span class="CoordinateTxt">' + oltmx.util.Tools.toDMSLatLon(latlon, ", ", ["度", "分", "秒"]) + '</span></li>').appendTo($menuContent.find("ul"));
        $('<li><a>TWD97 </a><span class="CoordinateTxt">' + Math.round(twd97[0]) + ", " + Math.round(twd97[1]) + '</span></li>').appendTo($menuContent.find("ul"));
        $('<li><a>TWD67 </a><span class="CoordinateTxt">' + Math.round(twd67[0]) + ", " + Math.round(twd67[1]) + '</span></li>').appendTo($menuContent.find("ul"));
        $("<p><a href='https://maps.google.com/maps?f=q&source=s_q&z=16&layer=c&cbll=" + latlon[1] + "," + latlon[0] + "' target='_blank'>開啟Google街景</a></p>").appendTo($menuContent);
        ovMenu.setMap(map);
        ovMenu.setPosition(coord);
    });

    map.on('singleclick', function (evt) {
        ovMenu.setMap(null);
        if (importSingleClickEventActive) return;
        var coord = evt.coordinate;
        //mdfFeatures.clear();
        //map.forEachFeatureAtPixel(
        //    evt.pixel,
        //    function (feature, layer) {
        //        mdfFeatures.push(feature);
        //    }
        //);
    });

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
                { id: "MeasureLength" },
                { id: "MeasureArea" },
                { id: "Locate" },
                { id: "LayersMg", params: { mapLayers: map_layers} },
                { id: "Editor" }
            ],
            displayPrj: displayPrj
        }
    );

    // 初始化底圖
    initBaseLayers();


    if (parent) {
        try {
            parent.mapPlugin = mapPlugin;
        } catch (err) {

        }
    }

    mapPlugin.layersMg.activeIdentify();

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
        if(key != layerName){
            mapPlugin.getBaseLayerGroup().getLayers().remove(baseLayerInfos[key].layer);
        }
        baseLayerInfos[key].display = false;
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