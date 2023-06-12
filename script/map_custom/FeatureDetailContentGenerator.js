
function genRainfallCharts(stNo, stName) {
    $(function () {
        $.getJSON(
            'service/GetChartData.ashx?data=rainfall&st_no=' + stNo + '&callback=?',
            function (data) {
                var category = data[0], rainData = data[1], accRainData = data[2];
                $('#featureDetailContent').highcharts(
                    {
                        chart: {
                            width: 548,
                            height: 400,
                            zoomType: 'xy'
                        },
                        title: {
                            text: '雨量 -- ' + stName
                        },
                        xAxis: {
                            type: 'category',
                            categories: category
                        },
                        yAxis: [{
                            title: {
                                text: '雨量(mm)',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            }
                        }, {
                            title: {
                                text: '累積雨量(mm)',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            opposite: true
                        }],
                        series: [{
                            type: 'column',
                            name: '時雨量',
                            data: rainData
                        }, {
                            name: '累績雨量',
                            data: accRainData
                        }]
                    }
                );
                $('#featureDetail').modal('show');
            });
    });
}

function genReservoirCharts(stNo, stName) {
    var bThreshold = false;
    switch (stNo) {
        case "10405":
        case "10401":
        case "10203":
            bThreshold = false;
            break;
        case "10201":
        case "10205":
        case "10204":
            bThreshold = true;
            break;
    }

    var threshold = {
        "10201": [238.23, 235.38, 223.17, 217.48],
        "10205": [143.3, 135.5, 127.7, 125.1],
        "10204": [80, 78, 73, 69]
    };
    var plotLines = [];
    if (bThreshold) {
        plotLines[0] = {
            value: threshold[stNo][0],
            color: 'green',
            width: 1,
            zIndex: 2,
            label: {
                text: '綠色警戒: ' + threshold[stNo][0],
                align: 'center',
                style: {
                    color: 'green'
                }
            }
        };
        plotLines[1] = {
            value: threshold[stNo][1],
            color: '#FFCC00',
            width: 1,
            zIndex: 2,
            label: {
                text: '黃色警戒: ' + threshold[stNo][1],
                align: 'center',
                y: 11,
                style: {
                    color: '#FFCC00'
                }
            }
        };
        plotLines[2] = {
            value: threshold[stNo][2],
            color: 'orange',
            width: 1,
            zIndex: 2,
            label: {
                text: '橙色警戒: ' + threshold[stNo][2],
                align: 'center',
                style: {
                    color: 'orange'
                }
            }
        };
        plotLines[3] = {
            value: threshold[stNo][3],
            color: 'red',
            width: 1,
            zIndex: 2,
            label: {
                text: '洪色警戒: ' + threshold[stNo][3],
                align: 'center',
                y: 11,
                style: {
                    color: 'red'
                }
            }
        };
    }

    $(function () {
        $.getJSON(
            'service/GetChartData.ashx?data=reservoir&st_no=' + stNo + '&callback=?',
            function (data) {
                var category = data[0];
                var waterLevelData = data[1];
                var capacityData = data[2];
                $('#featureDetailContent').children().remove();
                $('#featureDetailContent').highcharts(
                    {
                        chart: {
                            width: 548,
                            height: 400,
                            zoomType: 'y'
                        },
                        title: {
                            text: '水庫 -- ' + stName
                        },
                        xAxis: {
                            type: 'category',
                            categories: category
                        },
                        yAxis: [{
                            floor: 0,
                            title: {
                                text: '水位(公尺)',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            plotLines: plotLines
                        }, {
                            title: {
                                text: '有效蓄水量(萬立方公尺)',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            opposite: true
                        }],
                        series: [{
                            name: '水位',
                            data: waterLevelData,
                            yAxis: 0
                        }, {
                            name: '有效蓄水量',
                            data: capacityData,
                            yAxis: 1
                        }]
                    }
                );
                $('#featureDetail').modal('show');
            });
    });
}

function genWaterQualityCharts(stNo, stName) {
    $(function () {
        $.getJSON(
            'http://210.69.129.130/WraNBMobile104/getWraNBData.asmx/getQualityHourly?staNo=' + stNo + '&callback=?',
            function (resp) {
                var category = [];
                var quality = [];
                for (var i = 0; i < resp.getQuality.length; i++) {
                    var row = resp.getQuality[i];
                    var theDate = new Date(row.info_date + "+0800");
                    category[i] = row.Hour;
                    quality[i] = Math.round(row.TBD*100)/100;
                }
                $('#featureDetailContent').children().remove();
                $('#featureDetailContent').highcharts(
                    {
                        chart: {
                            width: 548,
                            height: 400,
                            zoomType: 'xy'
                        },
                        title: {
                            text: '水質 -- ' + stName
                        },
                        xAxis: {
                            type: 'category',
                            categories: category
                        },
                        yAxis: [{
                            title: {
                                text: '濁度值(NTU)',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value}',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            plotLines: [{
                                value: 3000,
                                color: 'red',
                                width: 1,
                                zIndex: 10,
                                label: {
                                    text: '警戒值: 3000',
                                    align: 'center',
                                    style: {
                                        color: 'gray'
                                    }
                                }
                            }],
                            minRange: 3500
                        }],
                        series: [{
                            name: '濁度值',
                            data: quality,
                            yAxis: 0
                        }]
                    }
                );
                $('#featureDetail').modal('show');
            });
    });
}