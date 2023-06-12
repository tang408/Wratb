// geoserver 的網址
var gisServerURL = "https://tm.gis.tw/geoserver/";

// 圖台顯示的坐標系統
var displayPrj = "EPSG:3826";

// 初始位置
var initPosition = [304738.30782686669, 2751666.2982631912, 307257.25128225522, 2754706.8483986757]; // 坐標系統為displayPrj POLYGON ((304738.30782686669 2751666.2982631912, 307257.25128225522 2751666.2982631912, 307257.25128225522 2754706.8483986757, 304738.30782686669 2754706.8483986757, 304738.30782686669 2751666.2982631912))
var initZoom = 9;

var maxZoomLevel = 18;
var minZoomLevel = 6;

var htmlCaptureService = "service/GenImageFromHtml.ashx";

// 定位到點時，zoom到此level
var locatingPointZoom = 16;

// how to show coordinates on the map
var coordinateTemplate = "TWD97：{x}, {y}";

// if false, measure is done in simple way on projected plane. Earth curvature is not taken into account
var useGeodesicMeasures = true;

var startAreaMeasureMsg = "請點選起始點";

var getCoordinateHelpMsg = "請選取要取得坐標的位置";

/**
* Message to show when the user is drawing a polygon.
* @type {string}
*/
var continueAreaMeasureMsg = '雙擊左鍵結束量測';

var startLengthMeasureMsg = "請點選起始點";

/**
* Message to show when the user is drawing a line.
* @type {string}
*/
var continueLengthMeasureMsg = '雙擊左鍵結束量測';

/**
* 如果serviceInfo的bubbleContent設成這個值，將自動列出所有欄位
* @type {string}
*/
var constAutoGenBubbleInfo = "#AUTO#";

/**
 * 設定啟用功能項
 * '00' : 全轄區
 * '01' : 底圖切換
 * '02' : 量測
 * '03' : 範圍查詢
 * '04' : 定位
 * '05' : 圖層套疊
 * '06' : 匯出
 * '07' : 關閉全部
 */
var enableFunctions = "00,01,02,04,05,06,07,08,09";

/*
* 預設的bubble info layout
* 必須有css="close"的dom，以實現關閉的動作
*/
var defaultBubbleContainerHTML = '<div class="ol-popup">'
        + '<div class="BtnFunc" style="float: right">'
        + '    <ul>'
        + '        <li class="close"><a href="javascript:void(0);">關閉</a></li>'
        + '    </ul>'
        + '</div>'
        + '<div class="MapBubbleStyle">'
        + '<table class="BubleTable">'
        + '<tbody></tbody>'
        + '</table>'
        + '</div>'
        + '</div>';


var defaultStyle = {
    stroke: { color: 'blue', width: 1 },
    fill: { color: 'rgba(255, 255, 0, 0.1)' },
    icon: {
        anchor: [0.5, 16],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixel',
        opacity: 0.9,
        src: 'images/map_legend/default.png'
    }
};