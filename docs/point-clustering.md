# **WMS Layers**

[< Back to Read Me](../README.md)

## See a Demo

For a fully-working example, fire-up a browser and one of the following example files:

[Raster](../examples/wms-raster.html) | [Heatmap](../examples/wms-heatmap.html) | [Point Cluster](../examples/point-cluster.html)

**Note**: You will need a current Mapbox API key and some minor modifications will be required in order to run each example. At a minimum, you will need a Kinetica table with Lat/Lon values, or WKT.

## Visualizing Point Clusters

In this example, we're using the power of Kinetica to aggregate millions of records into granular clusters (thousands as a result) and send them to the browser. Then we leverage the power of Mapbox and Supercluster to further aggregate these clusters based on zoom scale and visualize them on the map. The result is a performant and impressive display of clustering on a massive scale, that allows you to visualize millions of points in a digestable way. Furthermore, each cluster can be clicked-on to reveal statistics about the cluster itself, like how many individual points are contained, or the smallest or largest clusters contained in the current grouping.

## Initializing the Map

First, ensure Kinetica Kickbox.js and its styles are included in your page. If you're using npm to install kickbox, reference the JS near the closing `</body>` tag like so:

```html
<script src="/node_modules/kinetica-kickbox-mapbox-gl/dist/kinetica-kickbox-mapbox-gl.min.js"></script>
```

And the stylesheet should be loaded in the `<head>` tag like so:

```html
...
<link rel="stylesheet" href="/node_modules/kinetica-kickbox-mapbox-gl/dist/kinetica-kickbox-mapbox-gl.min.css" />
```

You will have to initialize your map before you can add a Kinetica WMS layer to it. Map initialization in Kinetica Kickbox.js is promisified so that you can ensure initialization is fully complete before your layers are added, thus avoiding startup errors. Because this initialization function sets up basic auth for Kinetica and connects to the Mapbox API all at once, it is intended to replace the existing map initialization function provided by Mapbox.

```javascript
kickbox.initMap({
    mapboxgl: mapboxgl,
    kineticaUrl: 'http://your-kinetica-address-here:9191',
    wmsUrl: 'http://your-kinetica-address-here:9191/wms',
    mapboxKey: 'your-mapbox-api-key',
    mapDiv: 'map',
    username: 'your-kinetica-username',
    password: 'your-kinetica-password'
}).then(function(map){...
```

The code above initilizes the Mapbox map, sets the parameters for basic authentication inside of Mapbox, and also sets the basic authentication parameters for any `XmlHttpRequests` made to Kinetica itself. The function returns the map, which is just a plain old Mapbox map.

## Adding a Point Cluster Layer

Next we need to add a point cluster layer to the map. If you were doing this manually, you would have to create and add a source, a layer, create a supercluster object, manually build the aggregations, get all of the atomic aggregations from Kinetica, and finally, bind every `zoomend` and `moveend` event to re-build the styling for your clusters in view. Fortunately, you can avoid that headache and simply use the following helper function:

```javascript
// Add a raster layer to the map
kickbox.addClusterLayer(map, {
    mapboxgl: mapboxgl,
    tableName: 'your-table-name',
    kineticaUrl: 'http://your-kinetica-address-here:9191/wms',
    layerId: 'unique-layer-id',
    clusterRadius: 40,
    clusteringPrecision: 7,
    useBbox: false,
    precision: 4,
    geohashAttr: 'geohash',
    xAttr: 'x',
    yAttr: 'y'
});
```

And that's it! When the clusters have been loaded from Kinetica and ingested by Supercluster, You should see them all appear on your map.

## Full Code Example

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8' />
        <title>Kinetica Kickbox: Point Cluster Example</title>
        <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />

        <!-- Include Mapbox stylesheet -->
        <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.css' rel='stylesheet' />

        <!-- Include Kickbox CSS -->
        <link rel="stylesheet" href='../dist/kickbox.css' />

        <!-- Configure Your Kinetica Config Here. Exposes a varaible called "kbConfig" -->
        <script src="./config.js"></script>

        <!-- Basic styling for the map -->
        <style>
            body { margin:0; padding:0;}
            #map { position:absolute; top:0; bottom:0; width:100%; transition: all 0.3s; }
        </style>
    </head>
    <body>
        <div id='map'></div>
        <!-- Include Mapbox and Kickbox -->
        <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.41.0/mapbox-gl.js'></script>
        <script src='../dist/kickbox.min.js'></script>

        <script>
            (function(mapboxgl) {

                var kbConfig = {
                    wmsUrl: 'your_kinetica_wms_url',
                    kineticaUrl: 'your_kinetica_api_url',
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

                // Initialize the map
                var layerId = tableName + '-cluster';

                kickbox.initMap({
                    zoom: 3,
                    mapDiv: 'map',
                    mapboxgl: mapboxgl,
                    mapboxKey: kbConfig.mapboxKey,
                    kineticaUrl: kbConfig.kineticaUrl,
                    wmsUrl: kbConfig.wmsUrl,
                    // If using basic authentication
                    // username: kbConfig.username,
                    // password: kbConfig.password
                }).then(function(map) {

                    // Add a raster layer to the map
                    kickbox.addClusterLayer(map, {
                        clusterRadius: 40,
                        clusteringPrecision: 10,
                        clusterMaxZoom: 24,
                        useBbox: false,
                        precision: 9,
                        layerId: layerId,
                        mapboxgl: mapboxgl,
                        tableName: kbConfig.tableName,
                        geohashAttr: kbConfig.geohashColumnName,
                        kineticaUrl: kbConfig.kineticaUrl,
                        xAttr: kbConfig.xColumnName,
                        yAttr: kbConfig.yColumnName
                    });
                });

            })(window.mapboxgl);
        </script>
    </body>
</html>
```

## A Note About Data Design

In order to visualize point clusters on your map, you first need to make sure that you have a geohashed column of coordinates in your table. The scope of geohashing is outside the scope of what we can cover in this documentation, but it suffices to say that geohashing encodes your latitude and longitude coordinates into a hexadecimal string of a predetermined precision. This string can then be run through a `GROUP BY` query using a substring with a passed precision to generate the atomic clusters used by our example.

We refer to them as "atomic clusters" because our example has no atomic records underlying the visuzliation (in the browser, that is) -- as that would produce far too many results for the browser to handle. Instead, we provide Supercluster with an atomic cluster (can be thousands of aggregated records), that it then further aggregated as the user zooms in or out. In essence we are providng you a way to visualize clusters of clusters in real-time, where the your basic level of clustering delivered by Kinetica is chosen based on experimentation and performance requirements.

Kinetica does have a function to generate geohashes, but it is currently undocumented. To generate a geohash column, use the `geohash_encode(x,y,precision)` function in Kinetica. Note you may have to swap the x and y to produce the desired results depending on your existing data. If you already have a set of lat/long or x/y columns in your table, you can project it using that function to generate a new column of geohashed coordinates.

[< Back to Read Me](./../README.md)