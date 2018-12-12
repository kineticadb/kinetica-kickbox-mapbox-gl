# API Documentation

[< Back to Read Me](../README.md)

# **Map Initialization**

## `initMap(options) -> {Promise<Map>}`

**Returns**

A Promise that delivers the Mapbox GL Map when initialized.

**Description**

Initializes a Mapbox web map.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`options` | `Object` | Yes | See below. | A configuration object for the heatmap layer.
`options.mapDiv` | `String` | Yes | 'my-map' | The div ID of the web map container.
`options.mapboxgl` | `Object` | Yes | | The mapboxgl object, usually from window.mapboxgl.
`options.mapboxKey` | `String` | Yes | | The Mapbox API key.
`options.kineticaUrl` | `String` | Yes | `http://your-server.com:9191` | The URL of the Kinetica REST API.
`options.wmsUrl` | `String` | Yes | `http://your-server.com:9191/wms` | The Kinetica WMS API Url, usually ending in :9191/wms.
`options.center` | `Array<Number>` | No | `[-3.888, 40.432]` | The center point at which the map should initialize.
`options.mapStyle` | `String` | No | `mapbox://styles/mapbox/dark-v9` | The Mapbox map style.
`options.zoom` | `Integer` | No | `15` | The Mapbox zoom scale with which to initialize the map.
`options.username` | `String` | No | `admin` | The basic auth username for the Kinetica REST API.
`options.password` | `String` | No | `12345` | The basic auth password for the Kinetica REST API.

# **WMS Layer**

## `addWmsLayer(map, options) -> {Promise<Object>}`

**Returns**

A layer parameters object, useful for testing purposes.

**Description**

Adds a WMS raster styled layer to the Mapbox map.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | Yes | | The Mapbox object returned from `initMap()`.
`options` | `Object` | Yes | See below. | A configuration object for the heatmap layer.
`options.wmsUrl` | `String` | Yes | `http://www.your-kinetica-install.com:9191/wms` | The URL of the Kinetica WMS API.
`options.layerId` | `String` | Yes | `my-raster-points` | A unique identifier for the layer. Cannot have the same id as any other added layer.
`options.layerType` | `String` | Yes | `raster` | The styling used to render the WMS image. Available options are `raster|heatmap|contour|labels|cb_raster`. Can optionally use `options.renderingOptions.layers` in lieu of this property.
`options.tableName` | `String` | Yes | `my_kinetica_table` | The source table on which you want to run identification.
`options.xAttr` | `String` | Yes (If not using a WKT column) | `x` | The column name representing your x data (often longitude).
`options.yAttr` | `String` | Yes (If not using a WKT column) | `y` | The column name representing your y data (often longitude).
`options.geoAttr` | `String` | Yes (If not using x/y columns) | `wkt` | The column name of your WKT data.
`options.before` | `String` | No | `some-other-layer` | The layer before (underneath) which you want the new layer to be added. Searches for the passed layer id, if none is found, it adds it on top of all existing layers.
`options.renderingOptions` | `Object` | No | `{POINTCOLORS: 'FF0000', POINTSHAPES: 'square', POINTSIZES: 4}` | Rendering options that dictate the styling of the WMS layer. See the [Kinetica WMS Docs](https://www.kinetica.com/docs/feature_overview/wms_feature_overview.html#raster) for all possible examples. Will use Kinetica's defaults if nothing is passed for this parameter.


## `updateWmsLayer(map, options) -> {Object}`

**Returns**

An object containing the map, wmsUrl, sourceName, layerName, queryParameters, and the redraw function. Useful for testing purposes.

**Description**

Updates a WMS layer's parameters with the passed options. Useful for updating WMS output styling parameters based on UI interactions.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | Yes | | The Mapbox object returned from `initMap()`.
`options` | `Object` | Yes | See below. | A configuration object for the heatmap layer.
`options.wmsUrl` | `String` | Yes | `http://www.your-kinetica-install.com:9191/wms` | The URL of the Kinetica WMS API.
`options.layerId` | `String` | Yes | `my-raster-points` | A unique identifier for the layer. Cannot have the same id as any other added layer.
`options.renderingOptions` | `Object` | No | `{POINTCOLORS: 'FF0000', POINTSHAPES: 'square', POINTSIZES: 4}` | Rendering options that dictate the styling of the WMS layer. See the [Kinetica WMS Docs](https://www.kinetica.com/docs/feature_overview/wms_feature_overview.html#raster) for all possible examples. Will use Kinetica's defaults if nothing is passed for this parameter.


## `updateWmsLayerType(map, layerId, layerType, deboucneLimit) -> {Object}`

**Returns**

An object containing the redraw function and the debounce limit. Useful for testing purposes.

**Description**

Changes an existing WMS layer's rendering type and sets all of its parameters to the default values. Helpful for changing a layer's presentation without having to destroy the old layer and create a new one.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | Yes | | The Mapbox object returned from `initMap()`.
`layerId` | `String` | Yes | `my-wms-layer` | The ID of the layer you wish to alter.
`layerType` | `String` | Yes | `heatmap` | (raster|heatmap|cb_raster|labels) The new type to which to change the existing layer.
`debounceLimit` | `Number (milliseconds)` | Optional | `1000` | A new debounce limit to use as a delay between the end of panend/zoomend events. Will default to 2000ms.



## `addCbLegend(map, legendTitle, location, cbConfig) -> {Void}`

**Returns**

The control object. Useful for removal of the legend at a later time.

**Description**

Adds a WMS raster styled layer to the Mapbox map.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | `Yes` | | A Mapbox web map object.
`options.title` | `String` | `Yes` | `My Legend` | A title to be added to the top of the legend.
`location` | `String` | `Yes` | The location of the screen to render the legend. E.g `top-right`.
`cbConfig` | `Object` | `Yes` |  | An object containing the `cbVals` and `pointColors` arrays.
`cbConfig.cbVals` | `Array<String>` | `Yes` | `['0:1', '0:2']` | An array of class break specifications to be shown next to the colored legend tokens.
`cbConfig.pointColors` | `Array<String>` | `Yes` | `['FFFFFF', 'FF0000']`, | An array of class break colors to be rendred as tokens next to the class breaks.


## `removeLayer(map, layerId) -> {Void}`

**Returns**

Void.

**Description**

Removes a layer based on a layer ID from the map. Avoids selection issues due to naming conventions used by Kinetica Kickbox.js.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | `Yes` | | A Mapbox map object.
`layerId` | `String` | `Yes` | `my-layer-id` | The layer ID of the added WMS layer you wish to remove.


## `removeSource(map, layerId) -> {Void}`

**Returns**

Void.

**Description**

Removes a source based on a layer ID from the map. Avoids selection issues due to naming conventions used by Kinetica Kickbox.js.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | `Yes` | | A Mapbox web map object.
`layerId` | `String` | `Yes` | `my-layer-id` | The layer ID of the added WMS layer you previously added. This is used to remove the source as well.

## `setLayerOpacity(map, layerId, opacity) -> {Void}`

**Returns**

Void

**Description**

A helper function to easily set a layer's opacity.

| Parameter | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | `Yes` | | A Mapbox web map object.
`layerId` | `String` | `Yes` | `my-layer` | The ID of the layer to modify.
`opacity` | `Number` | `Yes` | `0.6` | The new opacity to set the layer. Must be <= 1 or >= 0.


---

# **Cluster Layer**

## `addClusterLayer(map, options) -> {Promise}`

**Returns**

Returns a promise that resolves with the map, the cluster object, the update function, and the options used to generate the cluster. Useful for testing purposes.

**Description**

Adds a geohash cluster visualization layer to the Mapbox map.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | `Yes` | | A Mapbox web map object.
`options` | `Object` | Yes | See below. | A configuration object for the heatmap layer.
`options.kineticaUrl` | `String` | Yes | `http://www.your-kinetica-install.com:9191/wms` | The URL of the Kinetica REST API.
`options.layerId` | `String` | Yes | `my-raster-points` | A unique identifier for the layer. Cannot have the same id as any other added layer.
`options.tableName` | `String` | Yes | `my_kinetica_table` | The source table on which you want to run identification.
`options.xAttr` | `String` | Yes (If not using a WKT column) | `x` | The column name representing your x data (often longitude).
`options.yAttr` | `String` | Yes (If not using a WKT column) | `y` | The column name representing your y data (often longitude).
`options.geohashAttr` | `String` | Yes | `geohash` | The column name containing your geohashes.
`options.precision` | `Integer` | Yes | `4` | The precision with which to use on the initial database groupby of geohashes. Cannot exceed the length of your geohash. Higher numbers will produce a more granular view at the cost of performance.
`options.clusterRadius` | `Integer` | No | 40 | The visual radius on the map within which to generate clusters. Does not impact database performance, only client-side rendering.
`options.clusterMaxZoom` | `Integer` | No | `14` | The maximum zoom with which your clusters can be generated. Defaults to 14.
`options.useBbox` | `Boolean` | No | `true` | Whether to use your current bounding box within which to generate clusters, or whether to use the whole map instead. Defaults to no. When turned on, this usually generates more granular, high-density clusters.
`options.minSize` | `Integer` | No | `1` | The minimum visual size of each cluster dot. Defaults to 1 pixel.
`options.maxSize` | `Integer` | No | `20` | The maximum visual size of each cluster dot. Defaults to 20 pixels.
`options.minColor` | `String` | No | `#FF0000` | The color of the smallest clusters. Defaults to red. Will form a gradient to the `maxColor` parameter.
`options.maxColor` | `String` | No | `#00FF00` | The color of the largest clusters. Defaults to green. Will form a gradient to the `minColor` parameter.
`options.dbAggregations` | `Array<String>` | No | `["SUM(*) trip_distance"]` | An array of custom aggregations you wish to perform at the database level to be included as properties for the custom client-side aggregations.
`options.clientAggregations` | `Array<Object>` | No | `[{ key: 'clusterTotalSum', initial: 0, map: (key, properties) => { return Number(properties.clusterTotalSum); }, reduce: (accumulated, properties) => { return accumulated.clusterTotalSum + helper.roundTo(properties.clusterTotalSum, 2); } }]` | An array of custom aggregations you wish to perform at the client level using the granular aggregations from the database.

**Notes**

- A WKT column is not currently allowed when creating clusters. You must pass x/y column names.

# **Events**

## `on(eventName, callback(e)) -> {Void}`

**Returns**

Void.

**Description**

Registers a callback with the given event name. The first parameter passed to the callback should be an object with the eventName.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`eventName` | `String` | Yes | `postWmsLayerAdded` | The event name with which to register your listener callback.
`callback` | `Function` | Yes | `function() { return 'postWmsLayerAdded fired...'; }` | The callback to fire when the event is fired.

## `off(eventName, callback) -> {Void}`

**Returns**

Void.

**Description**

Unregisters a callback with the given event name and callback function.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`eventName` | `String` | Yes | `afterWmsLayerAdded` | The event name with which to register your listener callback.
`callback` | `Function` | Yes | `function() { return 'postWmsLayerAdded fired...'; }` | The callback that was registered with `on()`

## `offById(eventName, functionId) -> {Void}`

**Returns**

Void.

**Description**

Unregisters a callback that has a `kbFnId` that equals the passed `functionId`. Makes it easier to remove functions by referencing them by Id instead of storing references to that function globally.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`eventName` | `String` | Yes | `afterWmsLayerAdded` | The event name with which your callback was registered.
`functionId` | `String` | Yes `myFunctionId` | The value of your `kbFnId` property on your callback function.

## `trigger(eventName) -> {Void}`

**Returns**

Void.

**Description**

Triggers a Kinetica Kickbox.js event with the passed name.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`eventName` | `String` | Yes | `afterWmsLayerAdded` | The event name with which your callback was registered.

### **Kinetica Kickbox.js Events**

| Event Name | Description
| --- | --- |
`beforeWmsLayerAdded` | Fires just before a WMS layer is added to the map via Kinetica Kickbox.js.
`afterWmsLayerAdded` | Fires just after a WMS layer has been added to the map via Kinetica Kickbox.js
`beforeClusterLayerAdded` | Fires just before a cluster layer is added to the map via Kinetica Kickbox.js
`afterClusterLayerAdded` | Fires just after a cluster layer is added to the map via Kinetica Kickbox.js
`beforeWmsLayerRemoved` | Fires just before a WMS layer is removed from the map via Kinetica Kickbox.js
`afterWmsLayerRemoved` | Fires just after a WMS layer is removed from the map via Kinetica Kickbox.js
`beforeWmsSourceRemoved` | Fires just before a WMS layer is removed from the map via Kinetica Kickbox.js
`afterWmsSourceRemoved` | Fires just after a WMS layer is removed from the map via Kinetica Kickbox.js
`beforeZoomToBounds` | Fires just before zooming to bounds
`afterZoomToBounds` | Fires just after zooming to bounds
`beforeWmsLayerUpdated` | Fires just before a WMS layer is updated
`afterWmsLayerUpdated` | Fires just before a WMS layer is updated

---

# **Identify Modes**

## `enableIdentifyByRadiusMode(map, options) -> {Void}`

**Returns**

Void.

**Description**

Enables the identify by radius mode.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | Yes | | The Mapbox map object.
`options` | `Object` | Yes | See below. | An object containing the required parameters to enable the identify by radius mode.
`options.mapboxgl` | `Object` | Yes | `window.mapboxgl` | The Mapbox GL object, (often attached to window). NOTE: Requires separate install from Kinetica Kickbox.js.
`options.MapboxDraw` | `Object` | Yes | `window.MapboxDraw` | The Mapbox GL Draw object, (often attached to window). *NOTE: Requires separate install from Kinetica Kickbox.js.
`options.tableName` | `String` | Yes | `my_table_name` | The table name on which you want to run the identification mode.
`options.kineticaUrl` | `String` | Yes | `http://www.your-kinetica-install.com:9191/wms` | The URL of the Kinetica REST API.
`options.xAttr` | `String` | Yes (If not using a WKT column) | `x` | The name of the column containing the x values.
`options.yAttr` | `String` | Yes (If not using a WKT column) | `y` | The name of the column containing the y values.
`options.geoAttr` | `String` | Yes (If not using x/y columns) | `wkt` | The name of the column containing the WKT values.
`options.transformations` | `Array<Object>` | No | `[{condition: (columnName, columnType) => { return columnName === 'color_code'}, transformation: (record, name) => { record[name] = '#' + record[name]; return record; }}]` | An array of objects that contain two properties: `condition` which holds a function to determine whether the record should be transformed, and `transformation`, which holds a function that performs the actual transformation of the record. See the [Identify Documentation](./identify.md) for more information.


## `disableIdentifyMode(map) -> {Void}`

**Returns**

Void.

**Description**

Disables the currently active identify mode and unregisters all callbacks driving the user interaction with this mode.

**Note:** Kinetica Kickbox.js only allows an identify mode to be active on one layer at a time. Nor should you activate multiple identify modes simultaneously.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | Yes | `map` | The Mapbox map object.

## `enableIdentifyByPointMode(map, options) -> {Void}`

**Returns**

Void.

**Description**

Enables the identify by radius mode.

| Parameter | Type | Required|  Example | Description |
| --- | --- | --- | --- | --- |
`map` | `Object` | Yes | | The Mapbox map object.
`options` | `Object` | Yes | See below. | An object containing the required parameters to enable the identify by radius mode.
`options.mapboxgl` | `Object` | Yes | `window.mapboxgl` | The Mapbox GL object, (often attached to window). NOTE: Requires separate install from Kinetica Kickbox.js.
`options.MapboxDraw` | `Object` | Yes | `window.MapboxDraw` | The Mapbox GL Draw object, (often attached to window). *NOTE: Requires separate install from Kinetica Kickbox.js.
`options.radiusInMeters` | `Number` | Yes | `200` | The radius around the clicked point in meters to use as the search area.
`options.tableName` | `String` | Yes | `my_table_name` | The table name on which you want to run the identification mode.
`options.collection` | `String` | No | `my_collection` | An optional collection name to dump the results into.
`options.kineticaUrl` | `String` | Yes | `http://www.your-kinetica-install.com:9191/wms` | The URL of the Kinetica REST API.
`options.xAttr` | `String` | Yes (If not using a WKT column) | `x` | The name of the column containing the x values.
`options.yAttr` | `String` | Yes (If not using a WKT column) | `y` | The name of the column containing the y values.
`options.geoAttr` | `String` | Yes (If not using x/y columns) | `wkt` | The name of the column containing the WKT values.
`options.transformations` | `Array<Object>` | No | `[{condition: (columnName, columnType) => { return columnName === 'color_code'}, transformation: (record, name) => { record[name] = '#' + record[name]; return record; }}]` | An array of objects that contain two properties: `condition` which holds a function to determine whether the record should be transformed, and `transformation`, which holds a function that performs the actual transformation of the record. See the [Identify Documentation](./identify.md) for more information.

[< Back to Read Me](../README.md)