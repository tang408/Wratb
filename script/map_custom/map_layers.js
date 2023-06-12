/*****

*****/
var wranbServerLegendURL = gisServerURL + "RoadNineSlide/ows?service=WMS&request=GetLegendGraphic&format=image%2Fpng&width=24&height=24&layer=";
var map_layers =
{
    "主題圖":
    {
        name: "主題圖",
        type: "folder",
        sub: {
            "計畫範圍":
            {
                name: "計畫範圍",
                type: "node",
                legendIcon: wranbServerLegendURL + "map_scope_plan",
                geometryType: "polygon",
                //zIndex: 4,
                serviceInfo: {
                    type: "WMS",
                    url: gisServerURL + "ows",
                    targetPrj: "EPSG:3857",
                    params: {
                        VERSION: "1.3.0",
                        layers: "map_scope_plan"
                    }
                }
            },
            "監測範圍":
            {
                name: "監測範圍",
                type: "node",
                legendIcon: wranbServerLegendURL + "map_scope_monitor",
                geometryType: "polygon",
                //zIndex: 6,
                serviceInfo: {
                    type: "WMS",
                    url: gisServerURL + "ows",
                    targetPrj: "EPSG:3857",
                    params: {
                        VERSION: "1.3.0",
                        layers: "map_scope_monitor"
                    }
                }
            },
            "轄區範圍":
            {
                name: "轄區範圍",
                type: "node",
                legendIcon: wranbServerLegendURL + "map_scope_wratb",
                geometryType: "polygon",
                //zIndex: 7,
                serviceInfo: {
                    type: "WMS",
                    url: gisServerURL + "ows",
                    targetPrj: "EPSG:3857",
                    params: {
                        VERSION: "1.3.0",
                        layers: "map_scope_wratb"
                    }
                }
            },
            "county":
                 {
                     name: "縣市界",
                     type: "node",
                     legendIcon: wranbServerLegendURL + "map_county_wratb",
                     geometryType: "polygon",
                     zIndex: 9,
                     serviceInfo: {
                         type: "WMS",
                         url: gisServerURL + "ows",
                         targetPrj: "EPSG:3826",
                         params: {
                             VERSION: "1.3.0",
                             layers: "map_county_wratb"
                         }
                     }
                 },
            "town":
            {
                name: "鄉鎮區界",
                type: "node",
                legendIcon: wranbServerLegendURL + "map_town_wratb",
                geometryType: "polygon",
                //zIndex: 8,
                serviceInfo: {
                    type: "WMS",
                    url: gisServerURL + "ows",
                    targetPrj: "EPSG:3826",
                    params: {
                        VERSION: "1.3.0",
                        layers: "map_town_wratb"
                    }
                }
            },
            "土石流潛勢溪流":
            {
                name: "土石流潛勢溪流",
                type: "node",
                legendIcon: wranbServerLegendURL + "map_protential_debris_wratb",
                geometryType: "polyline",
                //zIndex: 3,
                serviceInfo: {
                    type: "WMS",
                    url: gisServerURL + "ows",
                    targetPrj: "EPSG:4326",
                    params: {
                        VERSION: "1.3.0",
                        layers: "map_protential_debris_wratb"
                    }
                }
            },
            "山崩與地滑地質敏感區":
            {
                name: "山崩與地滑地質敏感區",
                type: "node",
                legendIcon: wranbServerLegendURL + "map_easy_landslide_wratb",
                geometryType: "polygon",
                //zIndex: 5,
                serviceInfo: {
                    type: "WMS",
                    url: gisServerURL + "ows",
                    targetPrj: "EPSG:4326",
                    params: {
                        VERSION: "1.3.0",
                        layers: "map_easy_landslide_wratb"
                    }
                }
            },
            "QPESUMS過去一小時":
                {
                    name: "QPESUMS過去一小時",
                    type: "node",
                    legendIcon: "images/map_legend/雷達迴波圖.png",
                    geometryType: "image",
                    serviceInfo: {
                        type: "STATIC",
                        params: {
                            url: "Service/GetQPESUMS.ashx?type=before&width=900",
                            projection: "EPSG:4326",
                            imageExtent: [117.975, 19.975, 123.6, 27.1]
                        }
                    }
                },
            "QPESUMS未來一小時":
                {
                    name: "QPESUMS未來一小時",
                    type: "node",
                    legendIcon: "images/map_legend/雷達迴波圖.png",
                    geometryType: "image",
                    serviceInfo: {
                        type: "STATIC",
                        params: {
                            url: "Service/GetQPESUMS.ashx?type=after&width=900",
                            projection: "EPSG:4326",
                            imageExtent: [117.975, 19.975, 123.6, 27.1]
                        }
                    }
                }
        }
    },
    "測站":
    {
        name: "測站",
        type: "folder",
        sub: {
            "雨量": {
                name: "雨量",
                type: "folder",
                sub: {
                    "雨量-氣象局": {
                        name: "雨量-氣象局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_rain_gauge_cwb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_rain_gauge_cwb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                         + "<tr><th>當日累計雨量：</th><td class='_value'></td></tr>"
                                         + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                         + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setRainfallAggregate(feature, $theContent);
                            }
                        }
                    },
                    "雨量-水特局": {
                        name: "雨量-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_rain_gauge_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_rain_gauge_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                + "<tr><th>當日累計雨量：</th><td class='_value'></td></tr>"
                                + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setRainfallAggregate(feature, $theContent);
                            }
                        }
                    },
                    "雨量-十河局": {
                        name: "雨量-十河局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_rain_gauge_10",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_rain_gauge_10"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                         + "<tr><th>當日累計雨量：</th><td class='_value'></td></tr>"
                                         + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                         + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setRainfallAggregate(feature, $theContent);
                            }
                        }
                    },
                    "雨量-翡管局": {
                        name: "雨量-翡管局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_rain_gauge_feitsui",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_rain_gauge_feitsui"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                         + "<tr><th>當日累計雨量：</th><td class='_value'></td></tr>"
                                         + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                         + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setRainfallAggregate(feature, $theContent);
                            }
                        }
                    },
                    "雨量-水保局": {
                        name: "雨量-水保局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_rain_gauge_swcb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_rain_gauge_swcb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                         + "<tr><th>當日累計雨量：</th><td class='_value'></td></tr>"
                                         + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                         + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setRainfallAggregate(feature, $theContent);
                            }
                        }
                    }
                }
            },
            "水位": {
                name: "水位",
                type: "folder",
                sub: {
                    "水位-水特局": {
                        name: "水位-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_water_level_gauge_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_water_level_gauge_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                         + "<tr><th>即時資訊：</th><td class='_value'></td></tr>"
                                         + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                         + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setWaterlevel(feature, $theContent);
                            }
                        }
                    }
                }
            },
            "濁度": {
                name: "濁度",
                type: "folder",
                sub: {
                    "濁度-水特局": {
                        name: "濁度-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_turbidometer_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_turbidometer_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                         + "<tr><th>即時資訊：</th><td class='_value'></td></tr>"
                                         + "<tr><th>更新時間：</th><td class='_datetime'></td></tr>"
                                         + "</table>",
                            identifyCallback: function (feature, $theContent) {
                                setTurb(feature, $theContent);
                            }
                        }
                    }
                }
            },
            "工程設施": {
                name: "工程設施",
                type: "folder",
                sub: {
                    "工程設施-水特局": {
                        name: "工程設施-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_eng_facility",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:4326",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_eng_facility"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>工程名稱</th><td>{工程安稱}</td></tr>"
                                + "<tr><th>工區名稱</th><td>{工區安稱}</td></tr>"
                                + "<tr><th>工程內容</th><td>{工程內容}</td></tr>"
                                + "</table>"
                        }
                    }
                }
            },
            "攝影機": {
                name: "攝影機",
                type: "folder",
                sub: {
                    "攝影機-水特局": {
                        name: "攝影機-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_cctv_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:3826",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_cctv_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>測站名稱：</th><td>{name_c}</td></tr>"
                                + "</table>"
                        }
                    }
                }
            },
            "傾斜觀測": {
                name: "傾斜觀測",
                type: "folder",
                sub: {
                    "傾斜觀測-水特局": {
                        name: "傾斜觀測-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_slope_observation",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:3826",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_slope_observation"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                         + "<tr><th>名稱</th><td>{name}</td></tr>"
                                         + "</table>"
                        }
                    }
                }
            },
            "孔內伸縮": {
                name: "孔內伸縮",
                type: "folder",
                sub: {
                    "孔內伸縮-水特局": {
                        name: "孔內伸縮-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_bhexten_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:3826",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_bhexten_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>名稱：</th><td>{name_c}</td></tr>"
                                + "</table>"
                        }
                    }
                }
            },
            "地表位移計": {
                name: "地表位移計",
                type: "folder",
                sub: {
                    "地表位移計-水特局": {
                        name: "地表位移計-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_surfacedm_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:3826",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_surfacedm_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>名稱：</th><td>{name_c}</td></tr>"
                                + "</table>"
                        }
                    }
                }
            },
            "傾斜儀": {
                name: "傾斜儀",
                type: "folder",
                sub: {
                    "傾斜儀-水特局": {
                        name: "傾斜儀-水特局",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_inclinometer_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:3826",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_inclinometer_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>名稱：</th><td>{name_c}</td></tr>"
                                + "</table>"
                        }
                    }
                }
            },
            "SAAV": {
                name: "SAAV",
                type: "folder",
                sub: {
                    "SAAV-中央地質調查所": {
                        name: "SAAV-中央地質調查所",
                        type: "node",
                        legendIcon: wranbServerLegendURL + "map_saav_wratb",
                        geometryType: "point",
                        serviceInfo: {
                            type: "WMS",
                            url: gisServerURL + "ows",
                            targetPrj: "EPSG:3826",
                            params: {
                                VERSION: "1.3.0",
                                layers: "map_saav_wratb"
                            },
                            bubbleContent: "<table class='BubleTableS'>"
                                + "<tr><th>名稱：</th><td>{name_c}</td></tr>"
                                + "</table>"
                        }
                    }
                }
            }

        }
    }

};