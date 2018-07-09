//////////////////////////////
// Imported Modules
//////////////////////////////

// #region

import axios from 'axios';

// Lodash modules
import cloneDeep from 'lodash/cloneDeep';
import concat from 'lodash/concat';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';

import supercluster from 'supercluster';
import {featureCollection} from '@turf/helpers';

import events from '@/js/kickbox.events';
import helper from '@/js/kickbox.helper';
import logger from '@/js/logger';

// Make lightweight version of lodash
const lodash = {
  cloneDeep,
  concat,
  forEach,
  get,
  minBy,
  maxBy
};

// #endregion Imported Modules

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Adds a clustering layer to the pased map
 * @param {Object} map - The Mapbox map
 * @param {Object} options - The clustering options
 * @param {Object} mapboxgl - The mapboxgl object
 * @param {String} options.tableName - Required. The name of the table to generate the clusters
 * @param {String} options.kineticaUrl - Required. The API Url for Kinetica including the port number
 * @param {String} options.layerId - Required. The name of the layer to generate the clusters on. Must be unique.
 * @param {String} options.precision - Required. The precision with which to cluster the results
 * @param {String} options.xAttr - Required. The column containing the x value.
 * @param {String} options.yAttr - Required. The column containing the y value.
 * @param {String} options.geohashAttr - Required. The column name containing the geohashed strings.
 * @param {String} options.clusterRadius - Required. The visual radius with which to group the clusters
 * @param {String} options.clusterMaxZoom - Required. The visual radius with which to group the clusters. Defaults to 14.
 * @param {String} options.useBbox - Optional. Whether or not to use the current map bounding box to cluster the results.
 * @param {String} options.minSize - Optional. The minimum size of the cluster circles displayed on the map. Defaults to 1.
 * @param {String} options.maxSize - Optinoal. The maximum size of the cluster circles displayed on the map. Defaults to 20.
 * @param {String} options.minColor - Optional. The color of the smallest circles displayed on the map. Defaults to red.
 * @param {String} options.maxColor - Optional. The color of the largest circles displayed ont he map. Defaults to green.
 * @param {Array<String>} options.dbAggregations - Optional. An array of database aggregations to be used in the aggregate/groupby call.
 * @param {Array<Object>} options.clientAggregations - Optional. An array of objects containing initial (value), map (fn), and reduce (fn).
 */
async function addClusterLayer(map, options) {
  let self = this;
  let defaults = {
    clusterRadius: lodash.get(options, 'clusterRadius', 40),
    clusterMaxZoom: lodash.get(options, 'clusterMaxZoom', 14),
    aggregations: lodash.get(options, 'aggregations', []),
    labelColor: lodash.get(options, 'labelColor', '#000000'),
    labelHaloColor: lodash.get(options, 'labelHaloColor', '#FFFFFF'),
    minSize: lodash.get(options, 'minSize', 1),
    maxSize: lodash.get(options, 'maxSize', 20),
    minColor: lodash.get(options, 'minColor', '#FF0000'),
    maxColor: lodash.get(options, 'maxColor', '#00FF00')
  };

  let sourceId = options.layerId + '-source';
  let layerId = options.layerId + '-layer';
  let labelsLayerId = options.layerId + '-labels-layer';

  let features;
  try {
    features = await self._loadClusterFeatures(map, options);
  } catch (err) {
    logger.error(err);
  }

  // Add custom aggregations
  let aggregations = lodash.cloneDeep(defaults.aggregations);
  if (options.aggregations) {
    lodash.merge(aggregations, defaults.aggregations);
  }

  // Initialize the cluster with data loaded from Kinetica
  let cluster = this.initCluster(
    features, defaults.clusterRadius, defaults.clusterMaxZoom, options.clientAggregations);

  // Add the source and layer to the map
  events.trigger('beforeClusterLayerAdded');
  helper.addSource(map, sourceId, this._getClusterSourceDef(sourceId, cluster.cluster, map.getZoom()));
  helper.addLayer(map, this._getClusterLayerDef(layerId, sourceId));
  helper.addLayer(map, this._getLabelsLayerDef(labelsLayerId, sourceId, defaults.labelColor, defaults.labelHaloColor));
  events.trigger('afterClusterLayerAdded');

  let updateFn = this.updateClusters.bind(
    this,
    map,
    sourceId,
    layerId,
    cluster.cluster,
    defaults.clusterRadius,
    defaults.minSize,
    defaults.maxSize,
    defaults.minColor,
    defaults.maxColor);

  map.on('zoomend', updateFn)
    .on('moveend', updateFn);

  let addPopup = (e) => {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = self._propertiesToList(e.features[0].properties);
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new options.mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  };

  map.on('click', layerId, addPopup)
    .on('click', labelsLayerId, addPopup);

  // Fire it once to load initial view
  updateFn();

  return {map, cluster, features, updateFn, options: defaults}
}

/**
 * Initializes the cluster object
 * @param {Array<Object>} features - An array of GeoJSON Features
 * @param {*} clusterRadius - The cluster radius size
 * @param {*} clusterMaxZoom - The max zoom
 * @param {Array<Object>} aggregations - An array of objects with aggregation parameters
 * @param {String} aggregations.key - The key of the aggregation
 * @param {Any} aggregations.initial - The initial value to set the property to
 * @param {Function} aggregations.reduce - The reduce function. Takes accumulated and current value as parameters.
 * @returns {Object} - The cluster object
 */
function initCluster (features, clusterRadius, clusterMaxZoom, clientAggregations) {
  let baseAggregations = [
    {
      key: 'clusterTotalSum',
      initial: 0,
      map: (key, properties) => { return Number(properties.clusterTotalSum); },
      reduce: (accumulated, properties) => {
        return accumulated.clusterTotalSum + helper.roundTo(properties.clusterTotalSum, 2);
      }
    },
    {
      key: 'clusterTotalSumLocalized',
      initial: 0,
      reduce: (accumulated, properties) => {
        return accumulated.clusterTotalSum.toLocaleString(undefined);
      }
    },
    {
      key: 'smallestClusterSize',
      initial: 0,
      map: (key, properties) => { return Number(properties.clusterTotalSum); },
      reduce: (accumulated, properties) => {
        if (accumulated.smallestClusterSize === 0) {
          return properties.clusterTotalSum;
        }
        return Math.min(accumulated.smallestClusterSize, properties.clusterTotalSum);
      }
    },
    {
      key: 'largestClusterSize',
      initial: 0,
      map: (key, properties) => { return Number(properties.clusterTotalSum); },
      reduce: (accumulated, properties) => {
        if (accumulated.largestClusterSize === 0) {
          return properties.clusterTotalSum;
        }
        return Math.max(accumulated.largestClusterSize, properties.clusterTotalSum);
      }
    }
  ];

  // Add base aggregations to the passed aggregations
  let finalAggs = [];
  if (clientAggregations && clientAggregations.length > 0) {
    finalAggs = lodash.concat(baseAggregations, clientAggregations);
  } else {
    finalAggs = baseAggregations;
  }

  // Supercluster with property aggregation
  let cluster = supercluster({
    radius: clusterRadius,
    initial: function () {
      let retVal = {};

      // Add aggregations passed to the function
      lodash.forEach(finalAggs, (agg) => {
        retVal[agg.key] = agg.initial;
      });

      return retVal;
    },
    map: function (properties) {
      let retVal = lodash.cloneDeep(properties);

      // Map over any properties that do not require transformations
      lodash.forEach(finalAggs, (agg) => {
        if (agg.map) {
          retVal[agg.key] = agg.map(agg.key, properties);
        }
      });

      return retVal;
    },
    reduce: function (accumulated, properties) {
      lodash.forEach(finalAggs, (agg) => {
        accumulated[agg.key] = agg.reduce(accumulated, properties);
      });
    }
  });
  // Load the data into the cluster
  cluster.load(features);

  // Return cluster and aggs for testing
  return {cluster, aggregations: finalAggs};
}

/**
 * Updates the cluster layer and themes the points
 * @param {Object} map - The map object
 * @param {Object} cluster - The cluster object
 * @param {Numberpack} zoom - The zoom level
 */
function updateClusters (map, sourceId, layerId, cluster, clusterRadius, minSize, maxSize, minColor, maxColor) {
  cluster.options.radius = parseInt(clusterRadius);
  let boundsRaw = map.getBounds();
  let bounds = [boundsRaw._sw.lng, boundsRaw._sw.lat, boundsRaw._ne.lng, boundsRaw._ne.lat];
  let clusters = cluster.getClusters(bounds, Math.floor(map.getZoom()));
  let clusterData = featureCollection(clusters);
  let minMax = _getMinMax(map, cluster, 'clusterTotalSum');

  let layer = map.getLayer(layerId);
  if (!layer) {
    return;
  }

  // Update the layer's paint properties based on our current view
  let radiusPaintProps = _getRadiusPaintProperties(minMax, minSize, maxSize);
  map.setPaintProperty(layerId, 'circle-radius', radiusPaintProps);

  let colorPaintProperties = _getColorPaintProperties(minMax, minColor, maxColor);
  map.setPaintProperty(layerId, 'circle-color', colorPaintProperties);

  let source = map.getSource(sourceId);
  if (source) {
    source.setData(clusterData).load();
  }

  return {minMax, map: map};
}

function removeClusterLayer(map, layerId) {
  helper.removeLayer(map, layerId + '-layer');
  helper.removeLayer(map, layerId + '-labels-layer');
  helper.removeSource(map, layerId + '-source');
}

// #endregion Public Functions

//////////////////////////////
// Private Functions
//////////////////////////////

// #region

// eslint-disable-next-line no-unused-vars
function _propertiesToList(properties) {
  let retVal = '<h3>Properties</h3>';
  retVal += '<ul class="cluster-properties">';

  lodash.forEach(properties, (val, key) => {
    retVal += `<li class="cluster-property ${_classify(key)}"><b>${key}</b>: ${val}</li>`;
  });

  retVal += '</ul>';

  return retVal;
}

/**
 * Turns a string into a valid css class name
 * @param {String} name - The raw name
 * @returns {String} - A validly formatted css class name
 */
function _classify(name) {
  let retVal = '';
  // Strip spaces and turn into dashes
  retVal = name.replace(/ /g, '-').toLowerCase();
  // Strip punctuation not including dashes
  retVal = retVal.replace(/[.,/#!$%^&*;:{}=_`~()]/g, '');
  return retVal;
}

/**
 * Loads cluster features from the database and returns an array of records
 * @param {Object} options - The options with which to query Kinetica
 * @param {String} options.xAttr - Required. The name of the x column.
 * @param {String} options.yAttr - Required. The name of the y column.
 * @param {String} options.kineticaUrl - Required. The Kinetica API url including the port number
 * @param {Int} options.precision - Required. The precision with which to group the clusters at the lowest level
 * @param {Array<Strign>} options.dbAggregates - Optional. A array of aggregates you wish to perform at the database level.
 * @returns {Array<Object>} - An array of record objects from the DB, grouped by the cluster column
 */
function _loadClusterFeatures(map, options) {
  var postOptions = {
    'table_name': options.tableName,
    'column_names': [
      `SUBSTRING(${options.geohashAttr}, 1, ${options.precision}) as geohash_prefix`,
      'COUNT(*) as clusterTotalSum',
      `AVG(${options.xAttr}) as ${options.xAttr}`,
      `AVG(${options.yAttr}) as ${options.yAttr}`
    ],
    'limit': -9999,
    'offset': 0,
    'encoding': 'json',
    'options': {
      'sort_order': 'descending',
      'sort_by': 'value'
    }
  };

  // Push all db aggregations into the query
  if (options.dbAggregates) {
    lodash.forEach(options.dbAggregates, (agg) => {
      postOptions['column_names'].push(agg);
    });
  }

  if (options.useBbox) {
    postOptions.options.expression = `STXY_INTERSECTS(${options.xAttr}, ${options.yAttr}, ${helper.getBoundsWkt(map.getBounds())})`;
  }

  return axios.post(`${options.kineticaUrl}/aggregate/groupby`, postOptions)
    .then((response) => {
      let geoJson = helper.dynamicSchemaToGeoJson(response.data.data_str, options.xAttr, options.yAttr);
      let transformed = geoJson.map((val) => {
        val.properties.clusterTotalSumLocalized = val.properties.clusterTotalSum.toLocaleString();
        return val;
      });
      return transformed;
    }).catch((err) => { logger.error(err); });
}

/**
 * Returns the cluster source definition object
 * @param {String} sourceId - The source id
 * @param {Object} cluster - The instantiated supercluster object
 * @param {Float} zoom - The current zoom of the map
 * @returns {Object} - The cluster source definition object
 */
// eslint-disable-next-line no-unused-vars
function _getClusterSourceDef (sourceId, cluster, zoom) {
  let worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
  let clusterData = featureCollection(cluster.getClusters(worldBounds, Math.floor(zoom)));
  return {
    type: 'geojson',
    data: clusterData
  };
}

/**
 * Returns a cluster layer definition.
 * @param {String} layerId - The layer id
 * @param {String} sourceId - The source id
 * @returns {Object} - The cluster layer definition
 */
// eslint-disable-next-line no-unused-vars
function _getClusterLayerDef (layerId, sourceId) {
  return {
    id: layerId,
    type: 'circle',
    source: sourceId
  };
}

/**
 * Returns a layer definition for the cluster labels layer
 * @param {String} layerId - The layer id for the labels layer
 * @param {String} sourceId - The layer's source id
 * @param {String} labelColor - The label color
 * @param {String} haloColor - The label halo color
 * @returns {Object} - The labels layer definition object
 */
// eslint-disable-next-line no-unused-vars
function _getLabelsLayerDef (layerId, sourceId, labelColor, haloColor) {
  return {
    id: layerId,
    type: 'symbol',
    source: sourceId,
    layout: {
      'text-field': '{clusterTotalSumLocalized}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0.6, 0.0],
      'text-anchor': 'left',
      'text-size': 15
    },
    paint: {
      'text-color': labelColor,
      'text-halo-color': haloColor,
      'text-halo-width': 14
    }
  };
}

/**
 * Returns the paint properties for a cluster based on the current
 * min/max shown and the min/max size of cluster points set in the UI.
 * @param {Object} minMax - The min/max object
 * @param {Integer} minSize - The minimum size of the cluster points
 * @param {Integer} maxSize - The maximum size of the cluster points
 */
function _getRadiusPaintProperties (minMax, minSize, maxSize) {
  let paintProps = {
    'type': 'exponential',
    'property': 'clusterTotalSum',
    'stops': [
      [minMax.min, parseInt(minSize)],
      [minMax.max, parseInt(maxSize)]
    ]
  };

  if (minMax.min === minMax.max) {
    paintProps.stops = [[minMax.max, maxSize]];
  }

  return paintProps;
}

/**
 * Returns the color paint properties for the cluster layer based
 * on the current minmax and colors set in the UI.
 * @param {Object} minMax - The minmax object
 * @param {String} minColor - The min color
 * @param {Strin} maxColor - The max color
 */
function _getColorPaintProperties (minMax, minColor, maxColor) {
  return {
    'type': 'exponential',
    'property': 'clusterTotalSum',
    'stops': [
      [minMax.min, minColor],
      [minMax.max, maxColor]
    ]
  };
}

/**
 * Returns the min and max values for all cluster features based
 * on their sum property. Useful for finding the smallest
 * and largest clusters for automagic theming of cluster points.
 * @param {Object} clusterData - The cluster data object
 */
function _getMinMax (map, cluster, aggProp) {
  let bounds = map.getBounds();
  let boundsArr = [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat];
  let features = cluster.getClusters(boundsArr, Math.floor(map.getZoom()));

  let min = lodash.minBy(features, (feature) => {
    return feature.properties[aggProp];
  });

  let max = lodash.maxBy(features, (feature) => {
    return feature.properties[aggProp];
  });

  if (min && max) {
    return {min: min.properties[aggProp], max: max.properties[aggProp]};
  }

  return {min: 0, max: 100};
}

// #endregion Private Functions

//////////////////////////////
// Exported Module
//////////////////////////////

// #region

export default {
  addClusterLayer,
  initCluster,
  removeClusterLayer,
  updateClusters,
  _loadClusterFeatures,
  _propertiesToList,
  _getClusterLayerDef,
  _getClusterSourceDef,
  _getLabelsLayerDef
};

// #endregion Exported Module
