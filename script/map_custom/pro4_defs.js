proj4.defs([
    ["EPSG:3821", "+title=經緯度：TWD67 +proj=longlat +towgs84=-752,-358,-179,-.0000011698,.0000018398,.0000009822,.00002329 +ellps=aust_SA +units=度 +no_defs"]
    , ["EPSG:3825", "+title=二度分帶：TWD97 TM2 澎湖 +proj=tmerc +lat_0=0 +lon_0=119 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs"]
    , ["EPSG:3826", "+title=TWD97 TM2+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=公尺 +no_defs"]
    , ["EPSG:3828", "+title=TWD67 TM2+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=aust_SA +towgs84=-752,-358,-179,-0.0000011698,0.0000018398,0.0000009822,0.00002329 +units=公尺 +no_defs"]
    , ["EPSG:32768", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs"]
    , ["EPSG:32769", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs"]
    , ["EPSG:32770", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs"]
    , ["EPSG:32771", "+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs"]
]);
proj4.defs('urn:ogc:def:crs:EPSG::32768', proj4.defs('EPSG:32768'));
proj4.defs('urn:ogc:def:crs:EPSG::32769', proj4.defs('EPSG:32769'));
proj4.defs('urn:ogc:def:crs:EPSG::32770', proj4.defs('EPSG:32770'));
proj4.defs('urn:ogc:def:crs:EPSG::32771', proj4.defs('EPSG:32771'));
proj4.defs('EPSG:102443', proj4.defs('EPSG:3826'));
proj4.defs('urn:ogc:def:crs:EPSG:6.9:3826', proj4.defs('EPSG:3826'));
proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#32768', proj4.defs('EPSG:32768'));
proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#32769', proj4.defs('EPSG:32769'));
proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#32770', proj4.defs('EPSG:32770'));
proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#32771', proj4.defs('EPSG:32771'));
