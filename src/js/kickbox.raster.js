//////////////////////////////
// Private Vars
//////////////////////////////

// #region

let rasterDefaults = {
  STYLES: 'raster',
  USE_POINT_RENDERER: true,
  DOPOINTS: true,
  DOSHAPES: true,
  DOSYMBOLOGY: false,
  DOTRACKS: true,
  HASHLINEANGLES: 0,
  HASHLINECOLORS: 'FFFF00',
  HASHLINEINTERVALS: 20,
  HASHLINELENS: 1,
  HASHLINEWIDTHS: 3,
  ORDER_LAYERS: '',
  POINTCOLORS: 'FF0000',
  SHAPELINECOLORS: 'FFFF00',
  POINTOFFSET_X: 0,
  POINTOFFSET_Y: 0,
  POINTSHAPES: 'circle',
  POINTSIZES: 3,
  SHAPEFILLCOLORS: -1,
  SHAPELINEPATTERNLENS: 1,
  SHAPELINEPATTERNS: 0,
  SHAPELINEWIDTHS: 3,
  SYMBOLROTATIONS: '',
  TRACKHEADCOLORS: 'FFFFFF',
  TRACKHEADSHAPES: 'circle',
  TRACKHEADSIZES: 10,
  TRACKLINECOLORS: '00FF00',
  TRACKLINEWIDTHS: 3,
  TRACKMARKERCOLORS: '0000FF',
  TRACKMARKERSHAPES: 'none',
  TRACKMARKERSIZES: 2
};

// #endregion Private Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Returns the default WMS layer parameters
 * @return {Object} - The default WMS layer parameters for
 *                    a raster layer.
 */
function getLayerDefaults() {
  return rasterDefaults;
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
