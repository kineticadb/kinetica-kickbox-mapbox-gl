//////////////////////////////
// Module Imports
//////////////////////////////

// #region

import cloneDeep from 'lodash/cloneDeep';
import circle from '@turf/circle';
import turfLength from '@turf/length';
import {lineString} from '@turf/helpers';
import uuid from 'uuid/v4';

import dataAccess from './kickbox.identify.dataAccess';
import ui from './kickbox.identifyByRadiusMode.drawing.ui';

import logger from './logger';
var template = require('@/html/identify.handlebars');

const lodash = {
  cloneDeep
};

// #endregion Module Imports

//////////////////////////////
// Drawing Mode Interface
//////////////////////////////

// #region

var IdentifyMode = {};

// When the mode starts this function will be called.
// The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
// The value returned should be an object and will be passed to all other lifecycle functions
IdentifyMode.onSetup = function(opts) {
  var state = {};
  state.count = opts.count || 0;
  return state;
};

IdentifyMode.disableMode = function() {
  this.unregisterClickHandlers(this.popupId);
  this.popupInstance.remove();
}

// Whenever a user clicks on the map, Draw will call `onClick`
IdentifyMode.onClick = function(state, e) {
  state.count += 1;
  // On first click, start drawing
  if (state.count === 1) {
    this._startDrawingBuffer(state, e);
  // On second click end drawing and, show popup
  } else if (state.count === 2) {
    this._showPopup(state, e);
    // On third click, remove the buffer drawing
  } else if (state.count === 3) {
    this._removeBuffer(state, e);
  }
};

IdentifyMode.onMouseMove = function(state, e) {
  // On the second click, end drawing the buffer radius
  if (state.count === 1) {
    this._updateDrawingBuffer(state, e);
  }
}

// Whenever a user clicks on a key while focused on the map, it will be sent here
IdentifyMode.onKeyUp = function(state, e) {
  // ESC Key Pressed, return to selection mode
  // if (e.keyCode === 27) return this.changeMode('simple_select');
};

// This is the only required function for a mode.
// It decides which features currently in Draw's data store will be rendered on the map.
// All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
// See `styling-draw` in `API.md` for advice on making display features
IdentifyMode.toDisplayFeatures = function(state, geojson, display) {
  display(geojson);
};

/**
 * Registers an array of transformations applied to the presentation of the data
 * from Kinetica.
 * @param {Array<Function>} transformations - The array of transformation functions to register with the presentation.
 */
IdentifyMode.registerTransformations = function(transformations) {
  this.transformations = transformations;
}

// #endregion Drawing Mode Interface

//////////////////////////////
// Private Functions
//////////////////////////////

// #region

/**
 * Begins drawing the radius line string and buffer circle
 * @param {Object} state - The current state of the drawing
 * @param {Event} e - The click event that initiated this behavior
 */
IdentifyMode._startDrawingBuffer = function (state, e) {
  // Make a new circle and paint it on the map
  var circleGeoJson = circle([e.lngLat.lng, e.lngLat.lat], 1, {steps: 60, units: 'meters', id: 'identify-buffer-diameter'});
  var circleFeat = this.newFeature(circleGeoJson);
  state.diameterId = circleFeat.id;
  this.addFeature(circleFeat);

  // Make a new line string for the radius and paint it on the map
  var coords = [e.lngLat.lng, e.lngLat.lat];
  var emptyCoords = coords;
  var lineGeoJson = lineString([coords, emptyCoords], {id: 'identify-buffer-radius'}, {});
  var lineFeat = this.newFeature(lineGeoJson);
  state.radiusId = lineFeat.id;
  this.addFeature(lineFeat);
}

/**
 * Removes the buffer circle and radius line string
 * @param {Object} state - The current drawing state
 * @param {Event} e - The click event initiating this behavior
 */
IdentifyMode._removeBuffer = function (state, e) {
  state.count = 0;
  this.deleteFeature(state.radiusId);
  this.deleteFeature(state.diameterId);
  if (this.popupInstance) {
    this.unregisterClickHandlers(this.popupId);
    this.popupInstance.remove();
  }
}

/**
 * Ends the drawing of the buffer circle and radius line string
 * @param {Object} state - The current state of the drawing mode
 * @param {Event} e - The click event that initiated this behavior
 */
IdentifyMode._updateDrawingBuffer = function (state, e) {
  // Make sure we have both radius and diameter features
  let lineFeat = this.getFeature(state.radiusId);
  let circleFeat = this.getFeature(state.diameterId);
  if (!lineFeat || !circleFeat) {
    return;
  }

  // Update the radius measurement to mouse position
  lineFeat.updateCoordinate(1, e.lngLat.lng, e.lngLat.lat);

  // Draw a new circle based on the new radius
  let lineGeoJson = lineString(lineFeat.coordinates, lineFeat.properties, {});
  let radius = turfLength(lineGeoJson, {units: 'meters'});
  var circleGeoJson = circle(lineFeat.coordinates[0], radius, {steps: 60, units: 'meters', id: 'identify-buffer-diameter'});
  var newCircleFeat = this.newFeature(circleGeoJson);
  circleFeat.setCoordinates(newCircleFeat.coordinates);
  state.radiusInMeters = radius;
}

/**
 * Shows an identify popup after the buffer has been drawn
 * @param {Object} state - The state of the drawing mode
 * @param {Event} e - The click event that initiated this behavior
 */
IdentifyMode._showPopup = function (state, e) {
  let self = this;
  let coords = this.getFeature(state.radiusId).coordinates[0];
  if (!coords) {
    return;
  }
  this.popupInstance.setLngLat(coords)
    .addTo(this.map);

  // Setup popup & show it
  ui.showLoading(this.popupId, this.spin);

  let filter = {
    offset: 0,
    geometry: {
      center: coords,
      radius: state.radiusInMeters
    },
    tableName: self.tableName,
    viewName: `${self.tableName}-${uuid()}`
  }

  // Store x/y or wkt column names on the filter for later use
  if (this.xAttr && this.yAttr) {
    filter.xAttr = this.xAttr;
    filter.yAttr = this.yAttr;
  } else if (this.geoAttr) {
    filter.geoAttr = this.geoAttr;
  }

  // Set filter for use later
  this.lastFilter = filter;

  // Get results from kinetica and fill-out template
  return this.filterAndGetRecords(filter).then(() => {
    // Register click handlers for the popup view
    this._registerClickHandlers(this.popupId);
  });
}

/**
 * Renders the template to the popup
 * @param {String} popupId - The popup Id
 * @param {Object} spin - The spinner
 * @param {Object} state - The state of the widget
 * @param {Array<Number>} coords - The coordinates
 * @param {Array<Object>} data - The records from Kinetica
 */
IdentifyMode._renderTemplate = function(popupId, filter, data) {
  let self = this;
  let compiledTemplate = template({
    popupId,
    expression: filter.expression,
    recordIndex: filter.offset + 1,
    records: data.records,
    recordTotal: data.recordCount,
    radius: filter.geometry.radius,
    latitude: filter.geometry.center[1],
    longitude: filter.geometry.center[0]
  });

  self.popupInstance.setHTML(compiledTemplate);
  ui.hideLoading(popupId, this.spin);

  if (data.records.length === 0) {
    ui.noResultsFound(this.popupId);
  } else {
    ui.showResultCount(this.popupId);
  }
}

/**
 * Registers click handlers for the popup view
 * @param {String} popupId - The popup id string
 */
IdentifyMode._registerClickHandlers = function(popupId) {
  let self = this;
  // Next Button
  this._registerHandler(popupId, 'btn-next', 'click',
    self._incrementRecord.bind(this, popupId));

  // Prev Button
  this._registerHandler(popupId, 'btn-prev', 'click',
    self._decrementRecord.bind(this, popupId));

  // Filter view button
  this._registerHandler(popupId, 'btn-filter-view', 'click',
    ui.toggleView.bind(this, popupId, 'filter-view'));

  // Apply filter button
  this._registerHandler(popupId, 'btn-apply-filter', 'click',
    self._applyFilter.bind(this, popupId));

  // Clear filter button
  this._registerHandler(popupId, 'btn-clear-filter', 'click',
    self._clearFilter.bind(this, popupId));
}

/**
 * Unregisters all click handlers that are currently registered on this popup
 * @param {String} popupId - The popup id
 */
IdentifyMode.unregisterClickHandlers = function (popupId) {
  for (var i = 0; i < this.handlerRegistry.length; i++) {
    let fn = this.handlerRegistry[i];
    let el = document.querySelector(`#${popupId} .${fn.className}`);
    if (el && el.removeEventListener) {
      el.removeEventListener(fn.eventType, fn);
    }
  }
  this.handlerRegistry = [];
}

/**
 * Creates a handler on an element and registers it with our internal registry
 * @param {String} popupId - The id of the popup
 * @param {String} elementClassName - The name of the class of the element to select. Do not use period in name.
 * @param {String} eventType - The event type. E.g. 'click'
 * @param {Function} fn - The function to bind to the event
 */
IdentifyMode._registerHandler = function(popupId, elementClassName, eventType, fn) {
  fn.id = `${elementClassName}-${eventType}`;
  fn.eventType = eventType;
  fn.className = elementClassName;
  let el = document.querySelector(`#${popupId} .${elementClassName}`);
  el.addEventListener(eventType, fn);
  this.handlerRegistry.push(fn);
}

/**
 * Increments the record shown, or fires off a new page request and resets the active index
 * @param {String} popupId - The popup id string
 * @param {Event} e - The event which triggered this behavior
 */
IdentifyMode._incrementRecord = function(popupId, e) {
  let self = this;
  logger.debug('Incrementing record...');
  let activeIndex = ui.getActiveIndex(popupId);
  if (!activeIndex && activeIndex !== 0) {
    logger.warn('No record was currently active');
    return;
  }

  // If reached the end of the list, reset it and get more records
  let filters = lodash.cloneDeep(self.lastFilter);
  let recordIndex = filters.offset + activeIndex;
  // Handle out of bounds edge case
  if (recordIndex + 1 === this.recordTotal) {
    return;
  } else if (activeIndex === 9) {
    // Set new filter parameters
    filters.offset = filters.offset + 10;

    // Store the state of the filters for later use
    this.lastFilter = filters;

    // Get the records and display them
    ui.showLoading(popupId, this.spin);
    let viewName = self._getCurrentViewName(self.lastFilter);
    dataAccess.getRecords(self.kineticaUrl, viewName, filters.offset)
      .then((data) => {
        self._renderTemplate(popupId, filters, data);
        ui.setActiveRecord(popupId, 0, filters.offset);
        if (this.lastFilter.expression) {
          ui.appliedFilter(popupId);
        }
        // Re-bind click handlers for the newly rendered view
        self._registerClickHandlers(popupId);
      });
    return;
  }

  // Increment and show
  activeIndex += 1;
  recordIndex += 1;
  ui.setActiveRecord(popupId, activeIndex, recordIndex);
}

/**
 * Dencrements the record shown, or fires off a new page request and resets the active index
 * @param {String} popupId - The popup id string
 * @param {Event} e - The event which triggered this behavior
 */
IdentifyMode._decrementRecord = function(popupId, e) {
  let self = this;
  logger.debug('Decrementing record...');
  let activeIndex = ui.getActiveIndex(popupId);
  if (activeIndex === -1) {
    logger.warn('No record was currently active');
    return;
  }

  // If reached the end of the list, reset it and get more records
  let filters = lodash.cloneDeep(self.lastFilter);
  let recordIndex = filters.offset + activeIndex;
  // Handle out of bounds edge case
  if (recordIndex === 0) {
    return;
  } else if (activeIndex === 0) {
    // Set new filter parameters
    filters.offset = filters.offset - 10;

    // Store the state of the filters for later use
    this.lastFilter = filters;

    // Get the records and display them
    ui.showLoading(popupId, this.spin);
    let viewName = this._getCurrentViewName(self.lastFilter);
    dataAccess.getRecords(self.kineticaUrl, viewName, filters.offset)
      .then((data) => {
        self._renderTemplate(popupId, filters, data);
        recordIndex -= 1;
        ui.setActiveRecord(popupId, 9, recordIndex);
        if (this.lastFilter.expression) {
          ui.appliedFilter(popupId);
        }
        // Re-bind click handlers for newly rendered view
        self._registerClickHandlers(popupId);
      });
    return;
  }

  // Increment and show
  activeIndex -= 1;
  recordIndex -= 1;
  ui.setActiveRecord(popupId, activeIndex, recordIndex);
}

/**
 * Applies the filter expression from the UI and
 * gets records again.
 * @param {String} popupId - The popup id
 * @param {Event} e - The event which triggered this behavior
 */
IdentifyMode._applyFilter = function(popupId, e) {
  let self = this;
  this.lastFilter.expression = ui.getExpression(popupId);
  ui.toggleView(popupId, 'filter-view');
  if (!this.lastFilter.expression) {
    this.lastFilter.filteredViewName = null;
    ui.removedFilter(popupId);
    return;
  }
  logger.debug('Applying expression filter...', this.lastFilter);
  // Get results from kinetica and fill-out template
  this.filterViewAndGetRecords(this.lastFilter).then(() => {
    ui.appliedFilter(popupId);
    // Re-bind click handlers
    self._registerClickHandlers(popupId);
  });
}

/**
 * Returns the current view name based on the passed filter. Falls back
 * from filtered view name, to view name, to table name.
 * @param {Object} filter - The filter object
 * @returns {String} - The current view name.
 */
IdentifyMode._getCurrentViewName = function (filter) {
  if (filter.filteredViewName) {
    return filter.filteredViewName;
  } else if (filter.viewName) {
    return filter.viewName;
  } else {
    return filter.tableName;
  }
}

/**
 * Applies a filter to an existing radius filter and returns the results
 * @param {Object} filter - The filter object
 * @returns {Promise} - The promise of the results
 */
IdentifyMode.filterViewAndGetRecords = function(filter) {
  let self = this;
  // Setup the new filtered view parameters
  filter.filteredViewName = this.lastFilter.viewName + '-' + uuid();
  filter.offset = 0;

  // Filter the view and return the data
  return dataAccess.filterRecords(this.kineticaUrl, filter.viewName, filter).then(() => {
    return dataAccess.getRecords(self.kineticaUrl, filter.filteredViewName, filter.offset, self.transformations)
      .then(data => {
        this.recordTotal = data.recordCount;
        self._renderTemplate(this.popupId, filter, data);
        ui.setActiveRecord(this.popupId, 0, filter.offset);
      });
  }).catch(err => {
    logger.error('Error querying Kinetica...', err);
  });
}

/**
 * Filters and returns records based on the passed filter
 * parameters
 * @param {Object} filter - A filter object
 * @param {Object} state - The state of the mode
 */
IdentifyMode.filterAndGetRecords = function(filter, state) {
  let self = this;
  return dataAccess.filterRecordsByRadius(self.kineticaUrl, filter.tableName, filter)
    .then(() => {
      return dataAccess.getRecords(self.kineticaUrl, filter.viewName, filter.offset, self.transformations)
        .then(data => {
          this.recordTotal = data.recordCount;
          self._renderTemplate(this.popupId, filter, data);
          ui.setActiveRecord(this.popupId, 0, filter.offset);
        });
    }).catch(err => {
      logger.error('Error querying Kinetica...', err);
      if (state) {
        self._removeBuffer(state, null);
      }
    });
}

/**
 * Clears the filter and re-gets all records again.
 * @param {String} popupId - The popup id
 */
IdentifyMode._clearFilter = function (popupId) {
  let self = this;
  self.lastFilter.expression = null;
  ui.removedFilter(popupId);
  ui.clearExpression(popupId);
  ui.toggleView(popupId, 'filter-view');
  dataAccess.getRecords(self.kineticaUrl, self.lastFilter.viewName, self.lastFilter.offset, self.transformations)
    .then(data => {
      self.recordTotal = data.recordCount;
      self._renderTemplate(popupId, self.lastFilter, data);
      ui.setActiveRecord(popupId, 0, self.lastFilter.offset);
      self._registerClickHandlers(self.popupId);
    });
  logger.debug('Clearing expression filter...', self.lastFilter);
}

// #endregion Private Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default IdentifyMode;

// #endregion Module Exports
