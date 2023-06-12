var map_base =
{
    name: "baseMap",
    type: "folder",
    sub: {
        "通用版電子地圖": {          
            serviceInfo: {
                name: "通用版電子地圖",
                type: "WMTS",
                url: "https://wmts.nlsc.gov.tw/wmts",
                layer: 'EMAP5',
                matrixSet: 'GoogleMapsCompatible',
                requestEncoding: 'RESTful',
                useProxy: true
            }
        },
        "電子地圖": {
            serviceInfo: {
                name: "電子地圖",
                type: "WMTS",
                url: "https://gis.sinica.edu.tw/tgos/wmts",
                layer: 'TGOSMAP_W',
                matrixSet: 'GoogleMapsCompatible',
                requestEncoding: 'RESTful',
                useProxy: true
            }
        },     
        "電子地圖(僅道路)": {        
            serviceInfo: {
                name: "電子地圖(僅道路)",
                type: "WMTS",
                url: "https://wmts.nlsc.gov.tw/wmts",
                layer: 'EMAP2',
                matrixSet: 'GoogleMapsCompatible',
                requestEncoding: 'RESTful',
                useProxy: true
            }
        },
        "正射(航照)地圖": {   
            serviceInfo: {
                name: "正射(航照)地圖",
                type: "WMTS",
                url: "https://wmts.nlsc.gov.tw/wmts",
                layer: 'PHOTO2',
                matrixSet: 'GoogleMapsCompatible',
                requestEncoding: 'RESTful',            
                useProxy: true
            }
        },
        "福衛二號混合圖": {      
            serviceInfo: {
                name: "福衛二號混合圖",
                type: "WMTS",
                url: "https://gis.sinica.edu.tw/tgos/wmts",
                layer: 'ROADMAP_W',
                matrixSet: 'GoogleMapsCompatible',
                requestEncoding: 'RESTful',
                useProxy: true
            }
        },
        "地形暈渲混合圖": {       
            serviceInfo: {
                name: "地形暈渲混合圖",
                type: "WMTS",
                url: "https://gis.sinica.edu.tw/tgos/wmts",
                layer: 'HILLSHADEMIX_W',
                matrixSet: 'GoogleMapsCompatible',
                requestEncoding: 'RESTful',
                useProxy: true
            }
        },
    }
}