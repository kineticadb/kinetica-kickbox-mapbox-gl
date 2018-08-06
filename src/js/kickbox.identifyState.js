import {forEach} from 'lodash';

const lodash = {forEach};

var controls = {};
var modes = {};

/**
 * Disables and nullifies any currently active identify modes
 * @param {Object} map - The mapbox map object
 */
function disableIdentifyMode(map) {
  lodash.forEach(modes, (mode, layerId) => {
    if (!mode) {
      return;
    }
    // Safely disable the mode and kill its popup
    if (modes[layerId]) {
      modes[layerId].disableMode();
      modes[layerId] = null;
    }

    // Safely remove the control from the map
    if (controls[layerId]) {
      map.removeControl(controls[layerId]);
      controls[layerId] = null;
    }
  });
}

export default {modes, controls, disableIdentifyMode};
