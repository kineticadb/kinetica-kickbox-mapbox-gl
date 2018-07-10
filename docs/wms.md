# **WMS Layers**

[< Back to Read Me](../README.md)

## See a Demo

For a fully-working example, fire-up a browser and one of the following example files:

[Raster](../examples/wms-raster.html) | [Heatmap](../examples/wms-heatmap.html) | [Class Break Raster](../examples/wms-cb-raster.html) | [Point Cluster](../examples/point-cluster.html)

**Note**: You will need a current Mapbox API key and some minor modifications will be required in order to run each example. At a minimum, you will need a Kinetica table with Lat/Lon values, or WKT.

## Initializing the Map

First, ensure Kinetica Kickbox.js and its stylesheet are included in your page. If you're using npm to install kickbox, reference the JavaScript near the closing `</body>` tag like so:

```html
<script src="/node_moduleskinetica-kickbox-mapbox-gl/dist/kinetica-kickbox-mapbox-gl.min.js"></script>
```

And the css should be referenced in the `<head>` of your html like so:

```html
<link rel="stylesheet" href="/node_modules/kinetica-kickbox-mapbox-gl/dist/kinetica-kickbox-mapbox-gl.min.css" />
```

You will have to initialize your map before you can add a Kinetica WMS layer to it. Map initialization in Kinetica Kickbox.js is promisified so that you can ensure initialization is fully complete before your layers are added, thus avoiding startup errors. Because this initialization function sets up basic auth for Kinetica and connects to the Mapbox API all at once, it is intended to replace the existing map initialization function provided by Mapbox.

```javascript
kickbox.initMap({
    mapboxgl: mapboxgl,
    kineticaUrl: 'http://your-kinetica-address-here:9191',
    wmsUrl: 'http://your-kinetica-address-here:9191/wms',
    mapboxKey: 'your_mapbox_api_key',
    mapDiv: 'map',
    username: 'your_kinetica_username',
    password: 'your_kinetica_password'
}).then(function(map){...
```

The code above initilizes the Mapbox map, sets the parameters for basic authentication inside of Mapbox, and also sets the basic authentication parameters for any `XmlHttpRequests` made to Kinetica itself. The function returns the map, which is just a plain old Mapbox map.

## Adding a Raster/Heatmap/Contour Layer

Next we need to add a raster layer to the map. If you were doing this manually, you would have to create and add a source, a layer, build the WMS url by hand with all of the rendering parameters, and finally, bind every `zoomend` and `moveend` event to re-build the WMS url for your layer. Fortunately, you can avoid that headache and simply use the following helper function:

```javascript
kickbox.addWmsLayer(map, {
    layerType: 'raster', // can also be 'heatmap', or 'contour'
    wmsUrl: 'your_kinetica_wms_url',
    tableName: 'your_table_name',
    layerId: 'a_unique_layer_id',
    xAttr: 'x',
    yAttr: 'y',
    renderingOptions: {
        // Customize output here
    }
});
```

And that's all the code you need to visualize your data on a Mapbox map! If all of your configuration details are correct, you should see a raster layer rendered to your map in glourious Technicolor. And, by customizing the `renderingOptions` parameters, you can change the way the points are rendered -- like altering the size, color, and shape. See the [Kinetica documentation](https://www.kinetica.com/docs/feature_overview/wms_feature_overview.html) on WMS rendering options to customize your output.

**Note:** If you are using a WKT column instead of x/y or lat/long, you can replace the `xAttr` and `yAttr` properties with a `geoAttr` property referencing your column name.

## Adding a Labels Layer

Adding a labels layer is equally easy.

```javascript
// Add a labels layer to the map
kickbox.addWmsLayer(map, {
    layerType: 'labels',
    tableName: 'your_table_name',
    wmsUrl: 'your_kinetica_wms_url',
    layerId: 'a_unique_layer_id',
    xAttr: 'your_x_column',
    yAttr: 'your_y_column',
    renderingOptions: {
        LABEL_TEXT_STRING: 'your_column_name_here'
        // Customize output here
    }
});
```

## Adding a Class Break Raster Layer

You can thematically color the output of a raster layer based on the value of a chosen column using a Class Break Raster Layer. In other words, you can color the dots of your raster layer differently depending on the value each of those dots represents. For example, if you wanted to display a set of data containing GPS traces of car drive paths that included a column for car manufacturer, you could color all traces from BMW cars red and all traces from Ford cars blue.

## Resizing the Browser

Currently, there is a limitation in Mapbox that does not let you update the image source itself with a new image. Because of this, there is a glitch that occurs when you resize your browser window that distorts the currently displayed WMS layers. To correct this problem, the `addRasterLayer()` and `addHeatmapLayer()` functions will register a listener with the window that will automatically remove and re-add the layer any time the resize event is fired. This corrects the visual distortion, but may introduce a lag for a second while the layer is re-initialized.

Stay tuned to this GitHub issue which, when resolved, promises to deliver an update feature to an existing image source.

https://github.com/mapbox/mapbox-gl-js/issues/4050

## Full Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <title>Kinetica Kickbox: WMS Raster Example</title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />

    <!-- Include Mapbox stylesheet -->
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.css' rel='stylesheet' />

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
    <div id='map'></div>

    <!-- Include mapbox and kickbox library -->
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.js"></script>
    <script src="../dist/kickbox.min.js"></script>
    <script>
        (function(mapboxgl) {

            // Initialize the map
            var kbConfig = {
                kineticaUrl: 'your_kinetica_url',
                wmsUrl: 'your_kinetica_wms_url',
                mapboxKey: 'your_mapbox_api_key',
                tableName: 'your_table_name',
                xColumnName: 'your_x_column_name',
                yColumnName: 'your_y_column_name',
                geohashColumnName: 'your_geohash_column_name',
                center: [-74.2598555, 40.6971494],
                zoom: 8,
                // If using basic authentication
                // username: '',
                // password: ''
            };

            var layerId = tableName + '-raster';

            kickbox.initMap({
                mapDiv: 'map',
                mapboxgl: mapboxgl,
                mapboxKey: kbConfig.mapboxKey,
                kineticaUrl: kbConfig.kineticaUrl,
                wmsUrl: kbConfig.wmsUrl,
                // If using basic auth
                // username: kbConfig.username,
                // password: kbConfig.password
            }).then(function(map) {

                // Add a raster layer to the map
                kickbox.addWmsLayer(map, {
                    layerType: 'raster',
                    layerId: layerId,
                    wmsUrl: kbConfig.wmsUrl,
                    tableName: kbConfig.tableName,
                    xAttr: kbConfig.xColumnName,
                    yAttr: kbConfig.yColumnName,
                    // or if using WKT
                    // geoAttr: kbConfig.wktColumnName,
                    renderingOptions: {
                        POINTCOLORS: '00FF00',
                        POINTSIZES: 3
                    },
                });
            });

        })(window.mapboxgl);
    </script>
    </body>
</html>
```

[< Back to Read Me](./../README.md)