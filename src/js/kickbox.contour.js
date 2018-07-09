//////////////////////////////
// Private Vars
//////////////////////////////

// #region

let contourDefaults = {
  STYLES: 'contour',
  COLORMAP: 'jet',
  MIN_LEVEL: 1,
  MAX_LEVEL: 1,
  VAL_ATTR: 'z',
  SEARCH_RADIUS: 1,
  GRIDDING_METHOD: 'INV_DST_POW',
  RENDER_OUTPUT_GRID: 0,
  GRID_ROWS: 100,
  GRID_COLUMNS: -1
};

// #endregion Private Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Returns the default WMS layer parameters
 * @return {Object} - The default WMS layer parameters for
 *                    a contour layer.
 */
function getLayerDefaults() {
  return contourDefaults;
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default {
  getLayerDefaults
};

// #endregion Module Exports
