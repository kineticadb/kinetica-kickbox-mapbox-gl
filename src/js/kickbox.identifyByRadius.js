/* global ENV_TESTING */

//////////////////////////////
// Imported Modules
//////////////////////////////

// #region
import {Spinner} from 'spin.js';

import IdentifyByRadiusMode from './kickbox.identifyByRadiusMode.drawing';
import forEach from 'lodash/forEach';

const lodash = {
  forEach
};

// #endregion Imported Modules

//////////////////////////////
// Private Vars
//////////////////////////////

// #region

var controls = {};
var modes = {};

// #endregion Private Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Adds an feature identify popup window that can be activated
 * @param {Object} options - Required. The options with which to set up the popup
 * @param {Object} options.mapboxgl - Required. The mapboxgl instance
 * @param {Object} options.MapboxDraw - Required. The mapboxgl instance
 * @param {String} options.tableName - Required. The name of the table to query.
 * @param {String} options.kineticaUrl - Required. The URL of kinetica's RESt API.
 * @param {String} options.xAttr - Required. The x column name.
 * @param {String} options.yAttr - Required. The y column name.
 * @param {String} options.geoAttr - Required if not using x/y. The name of the wkt column.
 * @param {Array<Function>} options.transformations - Optional. Any transformations required to display a column to the user.
 *                                                    See documentation for transformation function formatting.
 */
function enableIdentifyByRadiusMode(map, options) {
  // We only allow one identify mode enabled at one time.
  // Loop through all modes and disable them all before proceeding
  lodash.forEach(modes, (mode, key) => {
    if (!mode) {
      return;
    }
    disableIdentifyByRadiusMode(map, key);
  });

  let MapboxDraw = options.MapboxDraw;

  // Scaffold the mode properties
  // Note, this must be done here since there
  // is no constructor and onSetup does not persist
  // these properties correctly
  let mode = IdentifyByRadiusMode;
  mode.mapboxgl = options.mapboxgl;
  mode.tableName = options.tableName;
  mode.kineticaUrl = options.kineticaUrl;
  mode.handlerRegistry = [];
  mode.popupId = 'popup-' + options.layerId;
  mode.popupInstance = new options.mapboxgl.Popup({closeButton: false, closeOnClick: false});
  mode.spin = new Spinner({color: '#CCC', lines: 12});

  // Set x/y or wkt column names for use in querying
  if (options.xAttr && options.yAttr) {
    mode.xAttr = options.xAttr;
    mode.yAttr = options.yAttr;
  } else if (options.geoAttr) {
    mode.geoAttr = options.geoAttr;
  }

  if (options.transformations) {
    mode.registerTransformations(options.transformations);
  }

  // Add the mode to the registry
  modes[options.layerId] = mode;

  // Add the control to the registry
  controls[options.layerId] = new MapboxDraw({
    defaultMode: 'identify_mode',
    controls: {
      point: false,
      line_string: false,
      polygon: false,
      trash: false,
      combine_features: false,
      uncombine_features: false
    },
    modes: Object.assign({
      identify_mode: mode
    }, MapboxDraw.modes)
  });

  map.addControl(controls[options.layerId], 'top-left');
}

/**
 * Disables the identify mode and unregisters all of the
 * registered click handlers for this mode
 * @param {Object} map - The mapbox map
 * @param {String} layerId - The layer id used for the identify mode
 */
function disableIdentifyByRadiusMode(map, layerId) {
  // Safely disable the mode and kill its popup
  if (modes[layerId]) {
    modes[layerId].disableMode();
    modes[layerId] = null;
  }

  // Safely remove the control from the map
  if (controls[layerId]) {
    map.removeControl(controls[layerId]);
    controls[layerId] = null;
    controls[layerId] = null;
  }
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

let mod = {
  disableIdentifyByRadiusMode,
  enableIdentifyByRadiusMode
};

// TODO: Come up with a cleaner solution to replace modules in tests
if (typeof ENV_TESTING !== 'undefined' && ENV_TESTING === true) {
  mod._identifyByRadius_spec = {
    modes,
    controls
  }
}

export default mod;

// #endregion Module Exports
