//////////////////////////////
// Private Vars
//////////////////////////////

// #region

let defaultParams = {
  STYLES: 'labels',
  LABEL_TEXT_STRING: '',
  LABEL_FONT: '',
  LABEL_TEXT_COLOR: 'FF000000',
  LABEL_TEXT_SCALE: 1,
  LABEL_TEXT_ANGLE: 0,
  LABEL_DRAW_BOX: 0,
  LABEL_DRAW_LEADER: 0,
  LABEL_LINE_WIDTH: 1,
  LABEL_LINE_COLOR: 'FF000000',
  LABEL_FILL_COLOR: 'FF000000',
  LABEL_LEADER_X_ATTR: '',
  LABEL_LEADER_Y_ATTR: '',
  LABEL_FILTER: ''
};

// #endregion Private Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Returns the default parameters for a label layer
 * @returns {Object} - An object containg all defaults for a labels layer.
 */
function getLayerDefaults() {
  return defaultParams;
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default {
  getLayerDefaults
}

// #endregion Module Exports
