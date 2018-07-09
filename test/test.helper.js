const lodash = require('lodash');

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

function mockSuperCluster() {
  let superCluster = {};
  superCluster.options = {radius: 40};
  superCluster.updateClusters = () => {};
  superCluster.getClusters = () => { return [{coordinates: [10, 10], properties: {id: 'mocked cluster'}}]; };
  return superCluster;
}

function mockInitMapOptions() {
  return {
    mapboxgl: {
      Map: function(options) {
        let map = mockMap(options);
        map.accessToken = options.accessToken;
        return map;
      }
    },
    mapboxKey: 'Obi-Wan',
    mapDiv: 'Lobot',
    mapStyle: 'Lando',
    zoom: 'Boba',
    center: 'Chewie'
  };
}

/**
 * Returns a mock map object with common functions and proeprties stubbed out
 * @returns {Object} - A mock map object
 */
function mockMap(options) {
  let map = {
    _container: 'my-div',
    _listeners: {},
    _completedEvents: [],
    sources: [],
    layers: [],
    _paintProperties: [],
    controls: []
  };
  if (options && options.container) {
    map.container = options.container;
  }
  if (options && options.style) {
    map.style = options.style;
  }
  if (options && options.zoom) {
    map.zoom = options.zoom;
  }
  if (options && options.center) {
    map.center = options.center;
  }

  if (!options) {
    options = {mapboxgl: {}};
  }
  if (!options.mapboxgl) {
    options.mapboxgl = {};
  }
  if (!options.mapboxgl.Map) {
    options.mapboxgl.Map = function(options) {
      let map = mockMap(options);
      map.accessToken = options.accessToken;
      return map;
    };
  }

  map.addSource = (id, def) => {
    let src = {};
    src.id = id;
    lodash.merge(src, def);
    map.sources.push(src);
  };
  map.removeControl = () => {};
  map.addLayer = layer => { map.layers.push(layer); };
  map.getZoom = () => { return 16; };
  map.getLayer = name => { return lodash.find(map.layers, layer => { return layer.name === name; }); };
  map.getSource = (id) => { return lodash.find(map.sources, source => { return source.id === id; }); };
  map.getBounds = () => { return {_ne: [0, 0], _sw: [1, 1]}; };
  map.setPaintProperty = (layerId, prop, value) => { map._paintProperties[prop] = {layerId, prop, value}; };
  map.addControl = (control) => { map.controls.push(control); };
  map.transformRequest = (url, resourceType) => { return {url, headers: {Authorization: 'Basic asdf1234==/'}}; };
  map.on = (eName, fn) => {
    if (lodash.includes(map._completedEvents, eName)) {
      fn();
      return;
    }
    if (!map._listeners[eName]) {
      map._listeners[eName] = [];
    }
    map._listeners[eName].push(fn);
    return map;
  }
  map.trigger = eName => {
    map._completedEvents.push(eName);
    lodash.forEach(map._listeners[eName], fn => { fn(); });
  }

  if (options && options.accessToken) {
    map.accessToken = options.accessToken;
  }

  map.trigger('load');
  return map;
}

function mockMapboxDraw(options) {
  let retVal = options || {};
  retVal.modes = {};

  return function () {
    return retVal;
  }
}

function mockMapboxGl(options) {
  return {
    Popup: function(options) {
      options.remove = () => {}
      return options;
    }
  }
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

module.exports = {
  mockSuperCluster,
  mockInitMapOptions,
  mockMapboxGl,
  mockMap,
  mockMapboxDraw
}

// #endregion Module Exports
