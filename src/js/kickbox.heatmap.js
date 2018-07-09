//////////////////////////////
// Public Vars
//////////////////////////////

// #region

let heatmapDefaults = {
  STYLES: 'heatmap',
  BLUR_RADIUS: 5,
  COLORMAP: 'jet',
  GRADIENT_START_COLOR: '000000',
  GRADIENT_END_COLOR: '000000',
  VAL_ATTR: ''
};

// #endregion Public Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Returns the default WMS layer parameters for a heatmap
 * @return {Object} - The default WMS layer parameters for
 *                    a heatmap layer.
 */
function getLayerDefaults() {
  return heatmapDefaults;
}

// #endregion Public Functions

//////////////////////////////
// Exported Module
//////////////////////////////

// #region

export default {
  getLayerDefaults
};

// #endregion Exported Module
