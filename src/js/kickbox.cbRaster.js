//////////////////////////////
// Module Imports
//////////////////////////////

// #region

// Lodash Modules
import forEach from 'lodash/forEach';

import helper from './kickbox.helper';
import logger from './logger';

const lodash = {
  forEach
};

// #endregion Module Imports

//////////////////////////////
// Private Vars
//////////////////////////////

// #region

let defaults = {
  STYLES: 'cb_raster',
  CB_ATTR: '',
  CB_VALS: '',
  ORDER_CLASSES: true,
  USE_POINT_RENDERER: true,
  POINTCOLORS: 'FF0000',
  POINTSIZES: '3',
  POINTSHAPES: 'circle'
};

// #endregion Private Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

function getLayerDefaults() {
  return defaults;
}

/**
 * Validates Class Break Raster parameters
 * ensuring that the correct number of arguments
 * and thier values are valid
 * @param {Object} params - The cb raster params
 */
function validateParams(params) {
  let retVal = {
    errs: [],
    isValid: true
  };

  let validations = {
    missingParams: _validateMissingParams(params),
    argLength: _validateArgLength(params),
    validBreaks: _validateBreaks(params)
  };

  lodash.forEach(validations, v => {
    if (!v.isValid) {
      retVal.isValid = false;
      lodash.forEach(v.errs, err => {
        logger.error(err);
        retVal.errs.push(err);
      });
    }
  });

  // Return errors for unit testing
  return retVal;
}

// #endregion Public Functions

//////////////////////////////
// Private Functions
//////////////////////////////

// #region

function _validateBreaks(params) {
  let isValid = true;
  let errs = [];

  let cbVals = helper.getNoCase(params, 'CB_VALS', null);
  if (!cbVals) {
    return {isValid: false, errs: ['Missing required parameters.']};
  }

  let cbValsArr = cbVals.split(',');
  for (var i = 0; i < cbValsArr.length; i++) {
    let currentBreak = cbValsArr[i].split(':');
    if (currentBreak[0] === currentBreak[1]) {
      isValid = false;
      errs.push(`Break is not formatted correctly. Values should not be the same for: ${cbValsArr[i]}`);
    }

    // Detect invalid class breaks
    // if (i > 0) {
    //   let prevBreak = cbValsArr[i - 1].split(':');
    //   // Detect same values
    //   if (currentBreak[0] !== prevBreak[1]) {
    //     errs.push(`Invalid class breaks provided: ${prevBreak} and ${currentBreak}`);
    //     isValid = false;
    //   }
    // }
  }

  return {isValid, errs};
}

function _validateArgLength(params) {
  let isValid = true;

  let cbVals = helper.getNoCase(params, 'CB_VALS', null);
  let pointColors = helper.getNoCase(params, 'POINTCOLORS', null);
  let pointSizes = helper.getNoCase(params, 'POINTSIZES', null);
  let pointShapes = helper.getNoCase(params, 'POINTSHAPES', null);

  if (!cbVals || !pointColors || !pointSizes || !pointShapes) {
    return {isValid: false, errs: ['Missing required parameters.']};
  }

  // Ensure number of arguemnts passed matches
  let lengths = {
    CB_VALS: cbVals.split(',').length,
    POINTCOLORS: pointColors.split(',').length,
    POINTSIZES: pointSizes.split(',').length,
    POINTSHAPES: pointShapes.split(',').length
  };

  let maxVal = 0;
  let badKeys = [];
  forEach(lengths, (val, key) => {
    // Set initial count expectation
    if (val > maxVal && maxVal === 0) {
      maxVal = val;
    }

    // Check that each key matches first length
    if (val !== maxVal && maxVal > 0) {
      badKeys.push(key);
    }
  });

  let errs;
  if (badKeys.length > 0) {
    isValid = false;
    errs = [`The following parameters do not match the length of CB_VALS (${maxVal}): ${badKeys.join(', ')}`];
  }

  return {isValid, errs};
}

function _validateMissingParams(params) {
  let isValid = true;
  let errs = [];

  let cbAttr = helper.getNoCase(params, 'CB_ATTR', null);
  let cbVals = helper.getNoCase(params, 'CB_VALS', null);
  let pointColors = helper.getNoCase(params, 'POINTCOLORS', null);
  let pointSizes = helper.getNoCase(params, 'POINTSIZES', null);
  let pointShapes = helper.getNoCase(params, 'POINTSHAPES', null);

  // Ensure all related parameters are present
  if (!cbAttr) {
    errs.push('No CB_ATTR provided for CB_RASTER WMS layer!');
    isValid = false;
  }
  if (!cbVals) {
    errs.push('No CB_VALS provided for CB_RASTER WMS layer!');
    isValid = false;
  }
  if (!pointColors) {
    isValid = false;
    errs.push('No POINTCOLORS provided for CB_RASTER WMS layer!');
  }
  if (!pointSizes) {
    isValid = false;
    errs.push('No POINTSIZES provided for CB_RASTER WMS layer!');
  }
  if (!pointShapes) {
    isValid = false;
    errs.push('No POINTSHAPES provided for CB_RASTER WMS layer!')
  }

  return {isValid, errs};
}

// #endregion Private Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default {
  getLayerDefaults,
  validateParams
}

// #endregion Module Exports
