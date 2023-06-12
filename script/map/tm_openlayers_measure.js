
// ==========================================
//              量測
// ==========================================
oltmx.measure = {
    isInMeasure: false
};
oltmx.measure.MeasureLength =
    function (mapPlugin) {
        var LEFT_CLICK_FUNC_MEASURE_LENGTH = "measure_length";
        var plugin = mapPlugin;
        var map = plugin.getMap();
        var onFinish;
        var draw;

        var measureTooltipElement;
        /**
        * Currently drawn feature.
        * @type {ol.Feature}
        */
        var sketch;

        /**
        * The help tooltip element.
        * @type {Element}
        */
        var helpTooltipElement;

        /**
        * Overlay to show the help messages.
        * @type {ol.Overlay}
        */
        var helpTooltip;

        /**
        * The measure tooltip element.
        * @type {Element}
        */
        var measureTooltipElement;

        /**
        * Overlay to show the measurement.
        * @type {ol.Overlay}
        */
        var measureTooltip;

        var source = new ol.source.Vector();

        var vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fa016b',
                    lineDash: [30, 10],
                    width: 4
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });
        plugin.getLayerGroup('measure').getLayers().push(vector);

        var styleConfig = typeof (oltmx_measure_length_draw) === "undefined" ? null : oltmx_measure_length_draw;
        if (!styleConfig) {
            styleConfig = {
                stroke: {
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [30, 10],
                    width: 2
                },
                circle: {
                    radius: 5,
                    stroke: {
                        color: 'rgba(0, 0, 0, 0.7)'
                    },
                    fill: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            };
        }
        draw = new ol.interaction.Draw({
            source: source,
            type: ('LineString'),
            style: plugin.getStyleFromOption(styleConfig)
        });


        // start length measure
        this.start = function (onfinish) {
            onFinish = onfinish;
            map.on('pointermove', moveHandlerForMeasure);

            map.addInteraction(draw);

            createMeasureTooltip();
            createHelpTooltip();

            draw.on('drawstart',
                  function (evt) {
                      source.clear();
                      if (measureTooltip) {
                          map.removeOverlay(measureTooltip);
                      }
                      measureTooltip = null;
                      createMeasureTooltip();
                      // set sketch
                      sketch = evt.feature;

                      /** @type {ol.Coordinate|undefined} */
                      var tooltipCoord = evt.coordinate;

                      //判斷Mobile點選圖台後的距離計算
                      listener = sketch.getGeometry().on('change', function (evt) {
                          var geom = evt.target;
                          var output;
                          length = calcLength(geom);
                          output = formatLength(length);
                          tooltipCoord = geom.getLastCoordinate();
                          var line = (sketch.getGeometry());
                          var coordinates = line.getCoordinates();
                          //將目前距離於測量頁面顯示
                          if (onFinish) {
                              onFinish(coordinates.length - 1, length, line);
                          }
                          
                          measureTooltipElement.innerHTML = output;
                          measureTooltip.setPosition(tooltipCoord);
                      });
                  }, this);

            draw.on('down', function (evt) {
            });

            draw.on('drawend',
                  function (evt) {
                      measureTooltipElement.className = 'tooltip tooltip-static';
                      measureTooltip.setOffset([0, -7]);
                      // unset sketch
                      sketch = null;
                      var line = evt.feature.getGeometry();
                      var coordinates = line.getCoordinates();
                      length = calcLength(line);
                      output = formatLength(length);
                      measureTooltipElement.innerHTML = output;
                      if (onFinish) {
                          onFinish(coordinates.length - 1, length, line);
                      }
                  }, this);
            oltmx.measure.isInMeasure = true;
            mapPlugin.activeLeftClickFunc(LEFT_CLICK_FUNC_MEASURE_LENGTH);
        }

        // stop measure
        this.stop = function () {
            map.un('pointermove', moveHandlerForMeasure);
            map.removeInteraction(draw);
            oltmx.measure.isInMeasure = false;
            mapPlugin.deactiveLeftClickFunc(LEFT_CLICK_FUNC_MEASURE_LENGTH);
        }

        // clear measure
        this.clear = function () {
            source.clear();
            if (helpTooltipElement) {
                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = null;
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = null;
            if (helpTooltip) {
                map.removeOverlay(helpTooltip);
            }
            helpTooltip = null;
            if (measureTooltip) {
                map.removeOverlay(measureTooltip);
            }
            measureTooltip = null;
        }

        /**
        * Creates a new help tooltip
        */
        function createHelpTooltip() {
            if (helpTooltipElement) {
                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = document.createElement('div');
            helpTooltipElement.className = 'tooltip';
            helpTooltip = new ol.Overlay({
                element: helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left'
            });
            map.addOverlay(helpTooltip);
        }


        /**
        * Creates a new measure tooltip
        */
        function createMeasureTooltip() {
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.style.cssText = "font-weight:bold; background-color:#da2ba2; border:1px solid #FFF; opacity:0.85; color: #FFF;";
            measureTooltipElement.className = 'tooltip tooltip-measure';
            measureTooltip = new ol.Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center'
            });
            map.addOverlay(measureTooltip);
        }

        /**
        * Handle pointer move.
        * @param {ol.MapBrowserEvent} evt
        */
        var moveHandlerForMeasure = function (evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = startLengthMeasureMsg;
            /** @type {ol.Coordinate|undefined} */
            var tooltipCoord = evt.coordinate;

            if (sketch) {
                var output;
                var line = (sketch.getGeometry());
                var coordinates = line.getCoordinates();
                length = calcLength(line);
                output = formatLength(length);
                if (onFinish) {
                    onFinish(coordinates.length - 1, length, line);
                }
                helpMsg = continueLengthMeasureMsg;
                tooltipCoord = line.getLastCoordinate();
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);
        };

        /**
        * format length output
        * @return {string}
        */
        var formatLength = function (length) {
            var output;
            if (length > 1000) {
                output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
            } else {
                output = (Math.round(length * 100) / 100) + ' ' + 'm';
            }
            return output;
        };

        var calcLength = function (line) {
            var length = 0;
            var coordinates = line.getCoordinates();
            if (useGeodesicMeasures) {
                var sourceProj = map.getView().getProjection();
                for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                    var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                    var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                    length += wgs84Sphere.haversineDistance(c1, c2);
                }
            } else {
                length = Math.round(line.getLength() * 100) / 100;
            }
            return length;
        }

        this.calcLength = calcLength;


        /**
        * 將目前這個level的pixel長度轉換成實際空間長度
        * NOTE:這個方式會受現在位置有所誤差，
        */
        this.transPixelLengthToSpatialLength = function (pixelLength) {
            var viewSize = map.getSize();
            var pixelStart = [Math.floor(viewSize[0] / 2), Math.floor(viewSize[1] / 2)];
            var pixelEnd = [pixelStart[0] + pixelLength, pixelStart[1]];
            var startPoint = plugin.transCoordinateFromMapPrj(map.getCoordinateFromPixel(pixelStart), 'EPSG:4326');
            var endPoint = plugin.transCoordinateFromMapPrj(map.getCoordinateFromPixel(pixelEnd), 'EPSG:4326');
            return wgs84Sphere.haversineDistance(startPoint, endPoint);
        };
    }

oltmx.measure.MeasureArea =
    function (mapPlugin) {
        var LEFT_CLICK_FUNC_MEASURE_AREA = "measure_area";

        var plugin = mapPlugin;
        var map = plugin.getMap();
        var onFinish;
        var draw;

        var measureTooltipElement;
        /**
        * Currently drawn feature.
        * @type {ol.Feature}
        */
        var sketch;

        /**
        * The help tooltip element.
        * @type {Element}
        */
        var helpTooltipElement;

        /**
        * Overlay to show the help messages.
        * @type {ol.Overlay}
        */
        var helpTooltip;

        /**
        * The measure tooltip element.
        * @type {Element}
        */
        var measureTooltipElement;

        /**
        * Overlay to show the measurement.
        * @type {ol.Overlay}
        */
        var measureTooltip;

        var source = new ol.source.Vector();

        var vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fa016b',
                    lineDash: [30, 10],
                    width: 4
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });
        plugin.getLayerGroup('measure').getLayers().push(vector);

        var styleConfig = typeof (oltmx_measure_area_draw) === "undefined" ? null : oltmx_measure_area_draw;
        if (!styleConfig) {
            styleConfig = {
                fill: {
                    color: 'rgba(255, 255, 255, 0.2)'
                },
                stroke: {
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [30, 10],
                    width: 2
                },
                circle: {
                    radius: 5,
                    stroke: {
                        color: 'rgba(0, 0, 0, 0.7)'
                    },
                    fill: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            };
        }

        draw = new ol.interaction.Draw({
            source: source,
            type: ('Polygon'),
            style: plugin.getStyleFromOption(styleConfig)
        });


        // start length measure
        this.start = function (onfinish) {
            onFinish = onfinish;
            map.on('pointermove', moveHandlerForMeasure);

            map.addInteraction(draw);

            createMeasureTooltip();
            createHelpTooltip();

            draw.on('drawstart',
                  function (evt) {
                      source.clear();
                      if (measureTooltip) {
                          map.removeOverlay(measureTooltip);
                      }
                      measureTooltip = null;
                      createMeasureTooltip();
                      // set sketch
                      sketch = evt.feature;
                      var tooltipCoord = evt.coordinate;

                      //判斷Mobile點選圖台後的距離計算
                      listener = sketch.getGeometry().on('change', function (evt) {
                          var geom = evt.target;
                          var output;
                          var area = calculateArea(geom);
                          output = formatArea(area);
                          tooltipCoord = geom.getInteriorPoint().getCoordinates();
                          var polygon = (sketch.getGeometry());
                          //將目前面積於測量頁面顯示
                          if (onFinish) {
                              onFinish(area, calculatePerimeter(polygon), polygon);
                          }

                          measureTooltipElement.innerHTML = output;
                          measureTooltip.setPosition(tooltipCoord);
                      });
                  }, this);

            draw.on('down', function (evt) {
            });

            draw.on('drawend',
                  function (evt) {
                      measureTooltipElement.className = 'tooltip tooltip-static';
                      measureTooltip.setOffset([0, -7]);
                      // unset sketch
                      sketch = null;

                      var polygon = evt.feature.getGeometry();
                      var area = calculateArea(polygon);
                      output = formatArea(area);
                      if (onFinish) {
                          onFinish(area, calculatePerimeter(polygon), polygon);
                      }
                      measureTooltipElement.innerHTML = output;
                  }, this);
            oltmx.measure.isInMeasure = true;
            plugin.activeLeftClickFunc(LEFT_CLICK_FUNC_MEASURE_AREA);
        }

        // stop measure
        this.stop = function () {
            map.un('pointermove', moveHandlerForMeasure);
            map.removeInteraction(draw);
            oltmx.measure.isInMeasure = false;
            plugin.deactiveLeftClickFunc(LEFT_CLICK_FUNC_MEASURE_AREA);
        }

        // clear measure
        this.clear = function () {
            source.clear();
            if (helpTooltipElement) {
                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = null;
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = null;
            if (helpTooltip) {
                map.removeOverlay(helpTooltip);
            }
            helpTooltip = null;
            if (measureTooltip) {
                map.removeOverlay(measureTooltip);
            }
            measureTooltip = null;
        }


        /**
        * Creates a new help tooltip
        */
        function createHelpTooltip() {
            if (helpTooltipElement) {
                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = document.createElement('div');
            helpTooltipElement.className = 'tooltip';
            helpTooltip = new ol.Overlay({
                element: helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left'
            });
            map.addOverlay(helpTooltip);
        }


        /**
        * Creates a new measure tooltip
        */
        function createMeasureTooltip() {
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.style.cssText = "font-weight:bold; background-color:#da2ba2; border:1px solid #FFF; opacity:0.85; color: #FFF;";
            measureTooltipElement.className = 'tooltip tooltip-measure';
            measureTooltip = new ol.Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center'
            });
            map.addOverlay(measureTooltip);
        }

        /**
        * Handle pointer move.
        * @param {ol.MapBrowserEvent} evt
        */
        var moveHandlerForMeasure = function (evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = startAreaMeasureMsg;
            /** @type {ol.Coordinate|undefined} */
            var tooltipCoord = evt.coordinate;

            if (sketch) {
                var output;
                var area;
                var polygon = sketch.getGeometry();
                area = calculateArea(polygon);
                output = formatArea(area);
                if (onFinish) {
                    onFinish(area, calculatePerimeter(polygon), polygon);
                }
                helpMsg = continueAreaMeasureMsg;
                tooltipCoord = polygon.getLastCoordinate();
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);
        };

        /**
        * format length output
        * @return {string}
        */
        var formatArea = function (area) {
            var output;
            if (area > 10000) {
                output = (Math.round(area / 1000000 * 100) / 100) +
                    ' ' + 'km<sup>2</sup>';
            } else {
                output = (Math.round(area * 100) / 100) +
                    ' ' + 'm<sup>2</sup>';
            }
            return output;
        };

        var calculatePerimeter = function (polygon) {
            var coordinates = polygon.getLinearRing(0).getCoordinates();
            var length = 0;
            if (useGeodesicMeasures) {
                var sourceProj = map.getView().getProjection();
                for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                    var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                    var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                    length += wgs84Sphere.haversineDistance(c1, c2);
                }
                // 點位數大於2, 才需要計算最後一個點到原點的長
                if (coordinates.length > 2) {
                    var c1 = ol.proj.transform(coordinates[0], sourceProj, 'EPSG:4326');
                    var c2 = ol.proj.transform(coordinates[coordinates.length - 1], sourceProj, 'EPSG:4326');
                    length += wgs84Sphere.haversineDistance(c1, c2);
                }
            } else {
                for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                    var c1 = coordinates[i];
                    var c2 = coordinates[i + 1];
                    length += Math.pow((Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2)), 0.5);
                }
                // 點位數大於2, 才需要計算最後一個點到原點的長
                if (coordinates.length > 2) {
                    var c1 = coordinates[0];
                    var c2 = coordinates[coordinates.length - 1];
                    length += Math.pow((Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2)), 0.5);
                }
            }
            return length;
        }

        var calculateArea = function (polygon) {
            var area = 0;
            if (useGeodesicMeasures) {
                var sourceProj = map.getView().getProjection();
                var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(sourceProj, 'EPSG:4326'));
                var coordinates = geom.getLinearRing(0).getCoordinates();
                area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
            } else {
                area = polygon.getArea();
            }
            return area;
        }
    }
