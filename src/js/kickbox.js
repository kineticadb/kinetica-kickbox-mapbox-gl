/* global ENV_TESTING btoa */

//////////////////////////////
// Imported Modules
//////////////////////////////

// #region

import axios from 'axios';

// lodash modules
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import merge from 'lodash/merge';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import findIndex from 'lodash/findIndex';
import remove from 'lodash/remove';
import extend from 'lodash/extend';

import cbRaster from '@/js/kickbox.cbRaster';
import cluster from '@/js/kickbox.cluster';
import controls from '@/js/kickbox.controls';
import contour from '@/js/kickbox.contour.js';
import events from '@/js/kickbox.events';
import heatmap from '@/js/kickbox.heatmap';
import helper from '@/js/kickbox.helper';
import identifyByRadius from '@/js/kickbox.identifyByRadius';
import identifyByPoint from '@/js/kickbox.identifyByPoint';
import labels from '@/js/kickbox.labels';
import logger from '@/js/logger';
import raster from '@/js/kickbox.raster';
import identifyState from '@/js/kickbox.identifyState';

// Organize modules in lightweight lodash
const lodash = {
  cloneDeep,
  get,
  merge,
  debounce,
  forEach,
  findIndex,
  remove,
  extend
};

// #endregion Imported Modules

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Initializes a mapbox map given the mapboxgl object and a valid api key.
 *
 * IMPORTANT NOTE: If using username and password for basic auth, these params are sent
 * with every database request and will be sent cleartext unless you have installed
 * an SSL certificate. It is highly recommended that you install an SSL certificate
 * before using basic auth.
 *
 * @param {Object} options - The options with which to initialize the map
 * @param {Object} options.mapboxgl - The MapboxGL object (typically from window or import statement)
 * @param {String} options.mapboxKey - The Mapbox API Key
 * @param {String?} options.wmsUrl - The Kinetica WMS API URL. Only used to set up basic auth.
 * @param {String} options.mapDiv - The ID of the map div
 * @param {Array<Number>} options.center - Optional. The starting center coordinates for the map. Defaults to San Francisco ,USA.
 * @param {String} options.mapStyle - Optional. The map style object. Defaults to mapbox://styles/mapbox/dark-v9.
 * @param {Number} options.zoom - Optional. The starting zoom of the map. Defaults to 4.
 * @param {String} options.username - Optional. The Kinetica username if using basic auth. Defaults to ''.
 * @param {String} options.password - Optional. The Kinetica password, if using basic auth. Defaults to ''.
 * @returns {Promise<Map>} - The promise of the mapbox-gl map.
 */
function initMap (options) {
  options.mapboxgl.accessToken = options.mapboxKey;
  let mapParams = {
    container: options.mapDiv,
    style: lodash.get(options, 'mapStyle', 'mapbox://styles/mapbox/dark-v9'),
    zoom: lodash.get(options, 'zoom', 4),
    center: lodash.get(options, 'center', [-3.8199625, 40.4378693])
  };

  let username = lodash.get(options, 'username', null);
  let password = lodash.get(options, 'password', null);

  // Setup basic auth if username and password are present
  if (username && password) {
    axios.interceptors.request.use((config) => {
      config.auth = {username, password};
      return config;
    });

    mapParams.transformRequest = function (url, resourceType) {
      // Adds a Kickbox identifier for integration adoption tracking
      if (url.slice(0, 22) === 'https://api.mapbox.com' ||
        url.slice(0, 26) === 'https://a.tiles.mapbox.com' ||
        url.slice(0, 26) === 'https://b.tiles.mapbox.com' ||
        url.slice(0, 26) === 'https://c.tiles.mapbox.com' ||
        url.slice(0, 26) === 'https://d.tiles.mapbox.com'
      ) {
        // Add Mapboxgl-Jupyter Plugin identifier for Mapbox API traffic
        return {
          url: [url.slice(0, url.indexOf('?') + 1), 'pluginName=Kickbox&', url.slice(url.indexOf('?') + 1)].join('')
        }
      }

      if (resourceType === 'Image' && url.startsWith(options.wmsUrl)) {
        let encodedCreds = btoa(`${username}:${password}`);
        return {
          url: url,
          headers: {'Authorization': `Basic ${encodedCreds}`}
        };
      }
    };
  }

  // Promisify the loaded map
  let map = new options.mapboxgl.Map(mapParams);
  let loadedPromise = new Promise((resolve, reject) => {
    map.on('load', () => {
      resolve(map);
    });

    map.on('error', err => {
      reject(err)
    });
  });

  return loadedPromise;
}

/**
 * Changes an existing WMS layer's type in-place using
 * the default layer parameters for the new type
 * @param {Object} map - The Mapbox map
 * @param {String} layerId - The layer ID
 * @param {String} layerType - The new type name
 * @returns {Object} - An object for testing
 */
function updateWmsLayerType(map, layerId, layerType, debounceLimit) {
  events.trigger('beforeUpdateWmsLayerType');

  let sourceName = layerId + '-source';
  let source = map.getSource(sourceName);
  if (!source) {
    let err = new Error(`No source found with name: ${sourceName}`);
    logger.error(err);
    return err;
  }

  // Get default layer parameters
  let coordinateParams = helper.getCoordinateParams(source.url);
  let baseParams = lodash.cloneDeep(helper.baseLayerParams);
  var defaults = _getLayerDefaults(layerType);
  let params = helper.getQueryParamsObject(source.url);

  // Make sure coordinates are mapped correctly
  if (params['STYLES'] !== 'labels' && layerType === 'labels') {
    baseParams.layers = params.layers;
    defaults.LABEL_LAYER = params.layers;
    defaults.LABEL_X_ATTR = coordinateParams['X_ATTR'];
    defaults.LABEL_Y_ATTR = coordinateParams['Y_ATTR'];
  } else {
    defaults.layers = params.layers
  }

  let queryParams = {};
  lodash.merge(queryParams, baseParams, defaults, coordinateParams);

  // Parse query params from existing URL
  let baseUrl = source.url.split('?')[0];
  let dbLimit = debounceLimit || 200;

  let redraw = _rebindWmsEvents(map, baseUrl, sourceName, layerId, queryParams, dbLimit);

  events.trigger('afterUpdateWmsLayerType');

  return {redraw, debounceLimit: dbLimit};
}

/**
 * Updates the layer parameters for a given layer and rebinds
 * the draw event on moveend and zoomend events.
 * @param {Object} map - Required. The map
 * @param {Object} options - The options
 * @param {String} options.wmsUrl - Required. The kinetica URL
 * @param {String} options.layerId - Required. The layer base name
 * @param {Object} options.renderingOptions - Required. The style parameters to update from the Kinetica WMS API docs.
 * @returns {Object} - An object for testing
 */
function updateWmsLayer(map, options) {
  events.trigger('beforeWmsLayerUpdated');
  // Build the new params URL
  let wmsUrl = options.wmsUrl;
  let sourceName = options.layerId + '-source';
  let source = map.getSource(sourceName);
  if (!source) {
    logger.warn(`No source found with name: ${sourceName}`);
    return;
  }

  // Parse query params from existing URL
  let queryParams = helper.getQueryParamsObject(source.url);

  // Handle Changes to Geometry Column(s)
  let xAttr = lodash.get(options, 'renderingOptions.X_ATTR', lodash.get(options, 'xAttr', null));
  let yAttr = lodash.get(options, 'renderingOptions.Y_ATTR', lodash.get(options, 'yAttr', null));
  let geoAttr = lodash.get(options, 'renderingOptions.GEO_ATTR', lodash.get(options, 'geoAttr', null));
  if (xAttr && yAttr) {
    queryParams['X_ATTR'] = xAttr;
    queryParams['Y_ATTR'] = yAttr;
    delete queryParams['GEO_ATTR'];
  } else if (geoAttr) {
    queryParams['GEO_ATTR'] = geoAttr;
    delete queryParams['X_ATTR'];
    delete queryParams['Y_ATTR'];
  }

  // Allow re-pointing of table
  let tableName = lodash.get(options, 'tableName', lodash.get(options, 'layers', null));
  if (tableName) {
    helper.setNoCase(queryParams, 'layers', tableName);
  }

  // Map rendering options into the URL
  lodash.forEach(options.renderingOptions, (option, key) => {
    helper.setNoCase(queryParams, key, option);
  });

  let debounceLimit = lodash.get(options, 'debounceLimit', 200);
  let redraw = _rebindWmsEvents(map, wmsUrl, sourceName, options.layerId, queryParams, debounceLimit);

  events.trigger('afterWmsLayerUpdated');

  // Return relevant data for testing
  return {map, wmsUrl, sourceName, layerId: options.layerId, queryParams, redraw};
}

/**
 * Rebinds the wms pan and zoom listeners for a given source/layer
 * @param {Object} map - The Mapbox map
 * @param {String} wmsUrl - The built WMS url
 * @param {String} sourceName - The name of the source
 * @param {String} layerId - The layer ID
 * @param {Object} queryParams - The query parameters object
 * @param {Number} debounceLimit - The debounce limit in milliseconds
 * @returns {Function} - The redraw function.
 */
function _rebindWmsEvents(map, wmsUrl, sourceName, layerId, queryParams, debounceLimit) {
  // Find the listeners and remove them
  let zoomIndex = lodash.findIndex(map._listeners.zoomend, fn => fn.sourceName === sourceName);
  let moveIndex = lodash.findIndex(map._listeners.moveend, fn => fn.sourceName === sourceName);
  if (zoomIndex > -1) {
    let zoomFn = map._listeners.zoomend[zoomIndex]
    map.off('zoomend', zoomFn)
  }
  if (moveIndex > -1) {
    let moveFn = map._listeners.moveend[moveIndex]
    map.off('moveend', moveFn)
  }

  // Rebind update
  var redraw = helper.bindWmsToSource.bind(this, map, wmsUrl, layerId, queryParams);
  var debouncedRedraw = lodash.debounce(redraw, debounceLimit);
  debouncedRedraw.sourceName = sourceName;

  map.on('moveend', debouncedRedraw)
    .on('zoomend', debouncedRedraw);

  debouncedRedraw();

  return redraw;
}

/**
 * Zooms to the boundary of the given table
 * @param {Object} map - The Mapbox map
 * @param {Object} options - The options to get the table bounds
 * @param {String} options.xAttr - Required if using lat/long columns. Name of the longitude column.
 * @param {String} options.yAttr - Required if using lat/long columns. Name of the latitude column.
 * @param {String} options.geoAttr - Required if using WKT column. Name of the WKT column.
 * @returns {Promise} - A promise of the fit to bounds resolution.
 */
function zoomToBounds(map, options) {
  events.trigger('beforeZoomToBounds');
  return helper.getTableBoundary(options)
    .then(bounds => {
      events.trigger('afterZoomToBounds');
      return map.fitBounds(bounds, {
        padding: 20
      });
    }).catch(err => {
      logger.error(err);
      return err;
    });
}

/**
 * Adds a WMS layer to the map
 * @param {Object} map - The Mapbox map
 * @param {Object} options
 * @param {String} options.layerType - The layer type (raster|heatmap|labels|cb_raster)
 * @param {String} options.tableName - The name of the table
 * @param {String} options.xAttr - The x column name
 * @param {String} options.yAttr - The y column name
 * @param {String} options.geoAttr - The wkt column name
 * @param {String} options.wmsUrl - The Kinetica WMS API URL
 * @param {Object} options.renderingOptions - See Kinetica's WMS styles documentation for options.
 * @returns {Object} - Returns the layer parameters, useful for testing purposes.
 */
function addWmsLayer(map, options) {
  // Parse relevant options
  let renderingOptions = lodash.get(options, 'renderingOptions', {});
  let layerParams = lodash.cloneDeep(helper.baseLayerParams);
  let layerType = helper.getNoCase(layerParams.renderingOptions, 'styles', helper.getNoCase(options, 'layerType', null));

  // Get default layer parameters
  var defaults = _getLayerDefaults(layerType)

  // Add tablename and styles, accept either layerType or styles
  layerParams.STYLES = layerType;

  if (layerType === 'labels') {
    // Map table name to layer name
    layerParams.LABEL_LAYER = options.tableName;
    // Add geometry column(s) to the query parameters
    layerParams.LABEL_X_ATTR = options.LABEL_X_ATTR || options.xAttr;
    layerParams.LABEL_Y_ATTR = options.LABEL_Y_ATTR || options.yAttr;
  } else {
    // Map table name to layer name
    layerParams.layers = options.tableName;
    // Add geometry column(s) to the query parameters
    if (options.xAttr && options.yAttr) {
      layerParams.X_ATTR = options.xAttr;
      layerParams.Y_ATTR = options.yAttr;
    } else {
      layerParams.GEO_ATTR = options.geoAttr;
    }
  }

  // Loop through all defaults and set either the rendering option or the default setting
  lodash.forEach(defaults, (defaultOption, key) => {
    helper.setOptionOrDefault(layerParams, renderingOptions, defaults, key);
  });

  // Validate CB Rasters to improve usability
  if (layerType === 'cb_raster') {
    cbRaster.validateParams(layerParams);
  }

  // Check if layer was already added.
  // Causes multiple renderings if not removed.
  let sourceName = `${options.layerId}-source`
  let existingLayer = map.getLayer(`${options.layerId}-layer`)
  let existingSource = map.getSource(sourceName)
  if (existingLayer || existingSource) {
    events.trigger('beforeWmsLayerAdded');
    updateWmsLayer(map, options)
    events.trigger('afterWmsLayerAdded');
  } else {
    // Build the layer and attach the event handlers
    events.trigger('beforeWmsLayerAdded');
    helper.bindWmsToSource(map, options.wmsUrl, options.layerId, layerParams, options);
    updateWmsLayer(map, options)
    events.trigger('afterWmsLayerAdded');

    // Add a patch for window resizing
    let boundHandler = _readdWmsLayer.bind(this, map, layerParams, options);
    let resizeHandler = lodash.debounce(boundHandler, 500);
    resizeHandler.sourceName = sourceName;
    map.on('resize', resizeHandler);
  }

  // Return relevant properties for testing
  return {layerParams};
}

/**
 * Removes a WMS layer and its source from the passed map
 * @param {Object} map - The map object
 * @param {String} layerId - The layer ID
 */
function removeWmsLayer(map, layerId) {
  helper.removeLayer(map, layerId + '-layer');
  helper.removeSource(map, layerId + '-source');
  lodash.remove(map._listeners.moveend, (e) => {
    return e.sourceName === `${layerId}-source`;
  });
  lodash.remove(map._listeners.zoomend, (e) => {
    return e.sourceName === `${layerId}-source`;
  });
  lodash.remove(map._listeners.resize, e => {
    return e.sourceName === `${layerId}-source`;
  });
}

/**
 * A helper function to easily set a layer's opacity.
 * @param {Object} map - The Mapbox map
 * @param {String} layerId - The layer ID
 * @param {Number} opacity - The opacity for the layer
 */
function setLayerOpacity(map, layerId, opacity) {
  map.setPaintProperty(layerId + '-layer', 'raster-opacity', opacity);
}

/**
 * Wrapper for cluster.addClusterLayer.
 * @param {Object} map - The map
 * @param {Object} options - The options
 * @returns {Promise} - The promise of the cluster layer added.
 */
function addClusterLayer(map, options) {
  events.trigger('beforeClusterLayerAdded');
  return cluster.addClusterLayer(map, options).then(results => {
    events.trigger('afterClusterLayerAdded');
    return results;
  });
}

/**
 * Handles a window resize event by removing and re-adding the passed layer
 * @param {Object} the layer to re-add
*/
function _readdWmsLayer(map, layerParams, options) {
  const opacity = map.getPaintProperty(
    options.layerId + '-layer',
    'raster-opacity'
  );
  helper.removeLayer(map, options.layerId + '-layer');
  helper.removeSource(map, options.layerId + '-source');

  // Update dimensions with new window size
  let dims = helper.getDivDimensions(map._container.id);
  layerParams.height = dims.height;
  layerParams.width = dims.width;
  helper.bindWmsToSource(map, options.wmsUrl, options.layerId, layerParams, options);
  setLayerOpacity(map, options.layerId, opacity);
}

/**
 * A helper function to remove a layer from the map object that
 * uses Kickbox's layer naming conventions.
 * @param {Object} map - The Mapbox web map object.
 * @param {String} layerId - The layer ID to remove.
 */
function removeLayer(map, layerId) {
  events.trigger('beforeWmsLayerRemoved');
  helper.removeLayer(map, layerId + '-layer');
  events.trigger('afterWmsLayerRemoved');
}

/**
 * A helper function to remove a source from the map object that
 * uses Kickbox's layer naming conventions.
 * @param {Object} map - The Mapbox web map object.
 * @param {String} layerId - The layer ID to remove.
 */
function removeSource(map, layerId) {
  events.trigger('beforeWmsSourceRemoved');
  helper.removeSource(map, layerId + '-source');
  events.trigger('afterWmsSourceRemoved');
}

/**
 * Registers a callback with an event type.
 * @param {String} name - The name of the event
 * @param {Function} cb - The callback to fire
 */
function on(name, cb) {
  events.register(name, cb);
}

/**
 * Unregisters a callback with an event type.
 * @param {String} name - The name of the event
 * @param {Function} cb - The callback to unregister
 */
function off(name, cb) {
  events.unregister(name, cb);
}

/**
 * Unregisters an event callback by passed ID rather than function.
 * Requires the function to have an kbFnId parameter set.
 * @param {String} name - The event name
 * @param {String} cbId - The callback ID.
 */
function offById(name, cbId) {
  events.unregisterById(name, cbId);
}

/**
 * Disables the identify mode and unregisters all of the
 * registered click handlers for this mode
 * @param {Object} map - The mapbox map
 */
function disableIdentifyMode(map) {
  identifyState.disableIdentifyMode(map);
}

// #endregion Public Functions

//////////////////////////////
// Private Functions
//////////////////////////////

// #region

/**
 * A wrapper function to clone the layer defaults for the passed
 * layer type.
 * @param {String} layerType - The layer type
 * @returns {Object} - The default params for the passed layer type.
 */
function _getLayerDefaults(layerType) {
  let defaults;
  if (layerType === 'heatmap') {
    defaults = lodash.cloneDeep(heatmap.getLayerDefaults());
  } else if (layerType === 'raster') {
    defaults = lodash.cloneDeep(raster.getLayerDefaults());
  } else if (layerType === 'cb_raster') {
    defaults = lodash.cloneDeep(cbRaster.getLayerDefaults());
  } else if (layerType === 'labels') {
    defaults = lodash.cloneDeep(labels.getLayerDefaults());
  } else if (layerType === 'contour') {
    defaults = lodash.cloneDeep(contour.getLayerDefaults());
  } else {
    logger.error('Layer type not recognized. Cannot load layer defaults.');
  }

  return defaults;
}

// #endregion Private Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

let mod = {
  addClusterLayer,
  addWmsLayer,
  disableIdentifyMode,
  on,
  off,
  offById,
  removeLayer,
  removeSource,
  removeClusterLayer: cluster.removeClusterLayer,
  removeWmsLayer,
  setLayerOpacity,
  initMap,
  updateWmsLayer,
  updateWmsLayerType,
  zoomToBounds
};

// TODO: Come up with a cleaner solution to replace modules in tests
if (typeof ENV_TESTING !== 'undefined' && ENV_TESTING === true) {
  mod._spec = {
    axios,
    cluster,
    helper
  }
}

export default lodash.extend(mod,
  identifyByRadius,
  identifyByPoint,
  controls
);

// #endregion Module Exports
