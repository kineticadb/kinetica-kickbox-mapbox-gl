# **Identify Modes**

[< Back to Read Me](../README.md)

## Introduction

The identify modes are bundled into Kinetica Kickbox.js as a quick way for your users to see the data that underlies your WMS output using native Mapbox popups. When you enable an identify mode for your user, you enable them to draw a circle, or click a point on the map, and generate a spatial filter as a result.

In the case of Identify by Radius, your users will draw a circle on the map and return results inside that circle. In the case of Identify by Point, you will hard-code a search radius ahead of time, so that when your users click a spot on the map, a circular spatial filter will be generated and applied &mdash;  simulating a point-and-click type of experience. Results from the applied spatial filter automatically paginate in groups of 10, so you don't overwhelm the browser with thousands of records at a time.

If your users recieve a large number of results, they can optionally input a Kinetica Expression filter in addition to their spatial filter by clicking the filter icon in the lower part of the identify popup. Kinetica Expressions are like SQL Where clause expressions, where you can use statements like `color = 'blue'` to further whittle-down your results. You can read all about [Kinetica Expressions here](https://www.kinetica.com/docs/concepts/expressions.html).

## Important Caveat

When using the identify modes in Kinetica Kickbox.js, you must supply both the MapboxGL JS and Mapbox Draw libraries to the identify mode function. We have chosen not to include those libraries directly in this project to keep its size as small as possible, and to avoid version issues that could arise.

## See a Demo

For a fully-working example, fire-up a browser and one of the following example files:

[Radius Mode](../examples/identify-by-radius.html) | [Point Mode](../examples/identify-by-point.html)

**Note**: You will need a current Mapbox API key and some minor modifications will be required in order to run each example. At a minimum, you will need a Kinetica table with Lat/Lon values, or WKT.

## Initializing the Map

We'll assume you have set up a WMS raster map by following the [instructions here](./wms.md). Once you have your map and layer ready, we'll proceed to enabling the identify modes below.

## Enabling Identify By Radius Mode

To enable the Identify by Radius Mode, simply place this code after your layer initialization code:

```javascript
var identifyOptions = {
    mapboxgl: mapboxgl, // See Important Caveat section above
    MapboxDraw: MapboxDraw, // See Important Caveat section above
    map: map, // The reference to your MapboxGL JS map object
    kineticaUrl: kbConfig.kineticaUrl, // Your kinetica URL. E.g. http://your-kinetica-instance.com:9191
    tableName: kbConfig.tableName, // The table upon which you want to run the identify queries
    layerId: tableName + '-raster', // A unique layer ID
    xAttr: kbConfig.xColumnName, // The column containing the longitude (or optionally specify geoAttr for a WKT column)
    yAttr: kbConfig.yColumnName // The column containing the latitude (Or optionally specify geoAttr for a WKT column)
};
kickbox.enableIdentifyByRadiusMode(map, identifyOptions);
```

## Disabling Identify By Radius Mode

When you're ready to disable this mode, you can call the following function. Kinetica Kickbox.js does not allow the identify mode to run on more than one layer at a time, so calling this function will disable any currently active Identify by Radius Mode. Note, you should not enable different identify modes at one time either, so take care to disable all other identify modes if you are switching to a new one.

```javascript
kickbox.disableIdentifyByRadiusMode(map);
```

## Enabling Identify by Point Mode

Identify by Point Mode is just as easy to enable, except this time, we will be providing one extra parameter to specify the search radius for the point selected on the map.

```javascript
var identifyOptions = {
    mapboxgl: mapboxgl, // See Important Caveat section above
    MapboxDraw: MapboxDraw, // See Important Caveat section above
    radiusInMeters: 500, // Set the hard-coded radius in meters here
    kineticaUrl: kbConfig.kineticaUrl, // Your kinetica URL. E.g. http://your-kinetica-instance.com:9191
    tableName: kbConfig.tableName, // The table upon which you want to run the identify queries
    layerId: kbConfig.tableName + '-raster', // A unique layer ID
    xAttr: kbConfig.xColumnName, // The column containing the longitude (or optionally specify geoAttr for a WKT column)
    yAttr: kbConfig.yColumnName // The column containing the latitude (Or optionally specify geoAttr for a WKT column)
}
kickbox.enableIdentifyByPointMode(map, identifyOptions);
```

## Disabling Identify By Point Mode

Disabling this mode is just like disabling the Identify by Radius mode:

```javascript
kickbox.disableIdentifyByRadiusMode(map);
```

## Full Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Kinetica Kickbox: Identify by Point Example</title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />

    <!-- Include Mapbox stylesheet -->
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.css' rel='stylesheet' />
    <link rel='stylesheet' href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.4/mapbox-gl-draw.css' type='text/css' />


    <!-- Include Kickbox CSS -->
    <link rel="stylesheet" href='../dist/kickbox.css' />

    <!-- Generic styles for Mapbox map -->
    <style>
        body { margin:0; padding:0;}
        #map { position:absolute; top:0; bottom:0; width:100%; transition: all 0.3s; }
    </style>
</head>
<body>
    <!-- Include a map div -->
    <div id="map"></div>

    <!-- Include mapbox and kickbox library -->
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.js"></script>
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.0.4/mapbox-gl-draw.js"></script>
    <script src="../dist/kickbox.min.js"></script>

    <!-- Configure Your Kinetica Config Here. Exposes a varaible called "kbConfig" -->
    <script src="./config.js"></script>

    <!-- jQuery only used to bind form events for this demo -->
    <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
    <script>
        (function(mapboxgl, kbConfig, MapboxDraw) {

            // Initialize the map
            var layerId = kbConfig.tableName + '-raster';

            kickbox.initMap({
                mapDiv: 'map',
                mapboxgl: mapboxgl,
                center: kbConfig.center,
                zoom: kbConfig.zoom,
                mapboxKey: kbConfig.mapboxKey,
                kineticaUrl: kbConfig.kineticaUrl,
                wmsUrl: kbConfig.wmsUrl
            }).then(function(map) {

                // Add a raster layer to the map
                kickbox.addWmsLayer(map, {
                    layerType: 'raster',
                    layerId: layerId,
                    wmsUrl: kbConfig.wmsUrl,
                    tableName: kbConfig.tableName,
                    xAttr: kbConfig.xColumnName,
                    yAttr: kbConfig.yColumnName,
                    renderingOptions: {
                        POINTCOLORS: 'FF0000',
                        POINTSIZES: 3
                    },
                });

                // Setup identify properties
                var identifyOptions = {
                    mapboxgl: mapboxgl,
                    MapboxDraw: MapboxDraw,
                    radiusInMeters: 500,
                    kineticaUrl: kbConfig.kineticaUrl,
                    tableName: kbConfig.tableName,
                    layerId: kbConfig.tableName + '-raster',
                    xAttr: kbConfig.xColumnName,
                    yAttr: kbConfig.yColumnName
                }
            });
        })(window.mapboxgl, window.kbConfig, window.MapboxDraw);
    </script>
</body>
</html>
```

[< Back to Read Me](./../README.md)