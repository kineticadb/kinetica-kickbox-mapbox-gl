//////////////////////////////
// Module Imports
//////////////////////////////

// #region

import KickboxCbLegendControl from './kickbox.control.cbLegend';

// #endregion Module Imports

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Adds a legend for a class break raster wms to the map
 * @param {Object} map - The mapbox map
 * @param {String} legendTitle - The title of the legend
 * @param {String} location - The location of the screen to inhabit. E.g 'top-right'
 * @param {Object} cbConfig - The classbreak configuration.
 * @param {Array<String>} cbConfig.cbVals - The array of class breaks
 * @param {Array<String>} cbConfig.pointColors - An array of hex colors WITHOUT THE HASH MARK.
 */
function addCbLegend(map, legendTitle, location, cbConfig) {
  map.addControl(new KickboxCbLegendControl(legendTitle, cbConfig.cbVals, cbConfig.pointColors), location);
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default {
  addCbLegend
}
// #endregion Module Exports
