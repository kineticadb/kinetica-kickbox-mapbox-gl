//////////////////////////////
// Module Imports
//////////////////////////////

// #region

import * as axios from 'axios';

// Lodash modules
import forEach from 'lodash/forEach';
import map from 'lodash/map';

import helper from './kickbox.helper';

const lodash = {
  forEach,
  map
};

// #endregion Module Imports

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Loads results from kinetica based on the identify boundary geometry and
 * any set filter expressions
 * @param {String} kineticaUrl - The url of Kinetica's REST API
 * @param {String} tableName - The name of the table to query
 * @param {Number} offset - The offset to use in the query
 * @param {Array<Function>} - An array of transformations applied to the presentation of the records.
 */
function getRecords(kineticaUrl, tableName, offset, transformations) {
  let self = this;
  let getParams = {
    'table_name': tableName,
    'offset': offset || 0,
    'limit': 10,
    'encoding': 'json',
    'options': {}
  };
  // Get the results from the filtered view
  return axios.post(`${kineticaUrl}/get/records`, getParams)
    .then(results => {
      // Inject records into view
      let records = helper.getRecordsJson(results.data);
      let schema = helper.getRecordsJsonSchema(results.data);
      let recordCount = helper.getRecordCount(results.data);
      let transformed = self.transformResults(records, schema, transformations);
      return {records: transformed, recordCount};
    });
}

/**
 * Filters a table based on the passed parameters
 * @param {String} kineticaUrl - The url of the kinetica REST API
 * @param {String} tableName - The table with which to filter
 * @param {Object} filter - The filter object
 * @param {Object} filter.geometry
 * @param {Number} filter.geometry.center - The center of the buffer
 * @param {Number} filter.geometry.radius - The radius in meters of the buffer
 * @param {String} filter.xAttr - The x column name
 * @param {String} filter.yAttr - The y column name
 * @param {String} filter.geoAttr - Optional. The WKT column name
 */
function filterRecordsByRadius(kineticaUrl, tableName, filter) {
  let filterParams = {
    'table_name': tableName,
    'x_center': filter.geometry.center[0],
    'y_center': filter.geometry.center[1],
    'radius': filter.geometry.radius,
    'options': {}
  };
  if (filter.filteredViewName) {
    filterParams['view_name'] = filter.filteredViewName;
  } else {
    filterParams['view_name'] = filter.viewName;
  }

  if (filter.collection) {
    filterParams.options.collection_name = filter.collection
  }

  // Build endpoint and column references based on table's data
  let endpoint = `${kineticaUrl}/filter/byradius`
  if (filter.xAttr && filter.yAttr && !filter.geoAttr) {
    filterParams['x_column_name'] = filter.xAttr;
    filterParams['y_column_name'] = filter.yAttr;
  } else {
    endpoint = `${kineticaUrl}/filter/byradius/geometry`
    filterParams['column_name'] = filter.geoAttr;
  }

  // Generate the filtered view
  return axios.post(endpoint, filterParams);
}

function filterRecords(kineticaUrl, tableName, filter) {
  let filterParams = {
    'table_name': tableName,
    'expression': filter.expression,
    'options': {}
  };

  if (filter.collection) {
    filterParams.options.collection_name = filter.collection
  }

  if (filter.filteredViewName) {
    filterParams['view_name'] = filter.filteredViewName;
  } else {
    filterParams['view_name'] = filter.viewName;
  }

  let endpoint = `${kineticaUrl}/filter`;

  return axios.post(endpoint, filterParams);
}

/**
 * Transforms the results from Kinetica into display-ready data
 * @param {Array<Object>} records - The array of records from Kinetica
 * @param {Object} schema - A mapping of name to type for the columns
 * @param {Array<Object>} customTransformations - The custom transformations to apply to the presentation
*                                                  of the records.
 */
function transformResults(records, schema, customTransformations) {
  // Queue-up the transformations based on the schema
  let transformations = [];
  lodash.forEach(schema, (type, name) => {
    // Detect and localize timestamps
    if ((name.match(/.*time.*/) || name.match(/.*date.*/)) && type === 'long') {
      transformations.push((record) => {
        let dtime = new Date(record[name]);
        record[name] = dtime.toLocaleString();
        return record;
      });
    }

    lodash.forEach(customTransformations, (trans) => {
      if (trans.condition(name, type)) {
        transformations.push(trans.fn.bind(null, name, type));
      }
    });
  });

  // Execute the transformations on the records
  let transformed = lodash.map(records, record => {
    lodash.forEach(transformations, trans => {
      record = trans(record);
    })
    return record;
  });

  return transformed;
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default {
  filterRecords,
  filterRecordsByRadius,
  getRecords,
  transformResults
}

// #endregion Module Exports
