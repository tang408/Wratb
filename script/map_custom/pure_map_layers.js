/*****

*****/
var wratbServerLegendURL = gisServerURL + "RoadNineSlide/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=24&height=24&layer=";
var map_layers =
{
    "slope_direction":
    {
        name: "坡度方向",
        type: "node",
        legendIcon: wratbServerLegendURL + "map_slope_direction",
        geometryType: "polyline",
        //zIndex: 6,
        serviceInfo: {
            type: "WFS",
            url: gisServerURL + "ows",
            targetPrj: "EPSG:3826",
            strategy: "all",
            params: {
                VERSION: "2.0.0",
                layer: "map_slope_direction",
                outputFormat: "json"
            },
            style: function (feature, resolution) {
                var direction = feature.get("方宅");
                if (direction == "A") {
                    return oltmx.util.Tools.getStyleFromOption(
                        {
                            stroke: {
                                color: "#AA0000",
                                width: 2
                            }
                        }
                    );
                } else if (direction == "B") {
                    return oltmx.util.Tools.getStyleFromOption(
                        {
                            stroke: {
                                color: "#008800",
                                width: 2
                            }
                        }
                    );
                } else {
                    return new ol.style.Style(
                        {
                            image: new ol.style.RegularShape(
                                {
                                    fill: new ol.style.Fill({ color: "#AA0000" }),
                                    points: 3,
                                    radius: 10,
                                    rotation: feature.get("rotate"),
                                    angle: 0
                                }
                            )
                        }
                    );
                }
            }
        },
        onInit: function () {
            var layer = mapPlugin.layersMg.getLayer(this);
            layer.getSource()
                .on(
                    'addfeature',
                    function (evt) {
                        var feature = evt.feature;
                        if (evt.feature.get("方宅") == "A") {
                            var points = evt.feature.getGeometry().clone().transform("EPSG:3857", "EPSG:3826").getCoordinates();
                            var start;
                            var end = [evt.feature.get("ar_x"), evt.feature.get("ar_y")];
                            for (var i = 0; i < points.length; i++) {
                                if (Math.abs(points[i][0] - end[0]) > 0.1 && Math.abs(points[i][1] - end[1]) > 0.1) {
                                    start = points[i];
                                    break;
                                }
                            }


                            // 計算三角形箭頭(原始指向北邊)順時針旋轉方向
                            var rotate;
                            {
                                var adjacent = Math.pow(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2), 0.5);

                                // 與X軸的夾角，可能是正向或負向
                                var rotate = Math.asin((end[1] - start[1]) / adjacent);

                                // 在X軸的正向或負向(鏡射)，從X軸正向順時鐘旋轉角度
                                if (end[0] - start[0] < 0) {
                                    // 在Y軸的左邊
                                    rotate = Math.PI + rotate;
                                } else {
                                    // 在Y軸的右邊
                                    rotate = - rotate;
                                }

                                // 三角形從90度順時鐘旋轉
                                rotate += Math.PI / 2;
                            }

                            var arrFeature = new ol.Feature();
                            arrFeature.setGeometry(new ol.geom.Point(end).transform("EPSG:3826", "EPSG:3857"));
                            arrFeature.set("rotate", rotate);
                            this.addFeature(arrFeature);
                        }
                    }
                );
        }
    },
    "cctv_scope":
    {
        name: "cctv_可視範圍",
        type: "node",
        legendIcon: wratbServerLegendURL + "map_cctv_angle",
        geometryType: "polygon",
        serviceInfo: {
            type: "WMS",
            url: gisServerURL + "ows",
            targetPrj: "EPSG:3826",
            params: {
                VERSION: "1.3.0",
                layers: "map_cctv_angle"
            }
        }
    }
};