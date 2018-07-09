//////////////////////////////
// Module Imports
//////////////////////////////

// #region

import logger from './logger';

// #endregion Module Imports

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Toggles a view by setting the class to active and hides all other sub views
 * @param {String} popupId - The popup id
 * @param {String} viewName - The view name
 * @param {Evvent} e - The event that triggered this behavior
 */
function toggleView(popupId, viewName, e) {
  // Turn on the views
  let viewElement = document.querySelector(`#${popupId} .${viewName}`);
  let btnElement = document.querySelector(`#${popupId} .btn-${viewName}`);
  _toggleClass(viewElement, 'active');
  _toggleClass(btnElement, 'active');
}

/**
 * Hides the loading popup for a given popup id
 * @param {String} popupId - The popup id
 * @param {Object} spin - The spinner object
 */
function hideLoading (popupId, spinner) {
  let element = document.querySelector(`body #${popupId} .blocker`);
  _hide(element);
  spinner.stop();
}

/**
 * Shows the result count when there are records to display
 * @param {String} popupId - The popup id
 */
function showResultCount(popupId) {
  let noResultsEl = document.querySelector(`#${popupId} .no-results`);
  let resultsCountEl = document.querySelector(`#${popupId} .result-count`);
  _hide(noResultsEl);
  _show(resultsCountEl);
}

/**
 * Hides the result count and shows a message when there are no records to display
 * @param {String} popupId - The popup id
 */
function noResultsFound(popupId) {
  let noResultsEl = document.querySelector(`#${popupId} .no-results`);
  let resultsCountEl = document.querySelector(`#${popupId} .result-count`);
  _show(noResultsEl);
  _hide(resultsCountEl);
}

/**
 * Shows the loading blocker for the given popup id
 * @param {String} popupId - The popup id
 */
function showLoading(popupId, spin) {
  // let popupEl = $(`body #${popupId} .blocker`).get(0);
  // $(popupEl).show();
  let popupEl = document.querySelector(`body #${popupId}`);
  let blockerEl = document.querySelector(`body #${popupId} .blocker`);
  _addClass(popupEl, 'active');
  _addClass(blockerEl, 'active');
  _show(popupEl);
  spin.spin(popupEl);
  return spin;
}

/**
 * Returns the actively shown div index based
 * on it's data property 'record-index'
 * @param {String} popupId - The popup id
 * @returns {Number} - The active index shown. Returns -1 if no index is active.
 */
function getActiveIndex(popupId) {
  // let activeIndex = $(`#${popupId} .record-data.active`).data('record-index');
  let activeIndex = document.querySelector(`#${popupId} .record-data.active`).dataset.recordIndex;
  activeIndex = parseInt(activeIndex);
  if (!activeIndex && activeIndex !== 0) {
    return -1;
  }
  return activeIndex;
}

/**
 * Sets the active record and the record index
 * @param {String} popupId - THe popup id
 * @param {Number} index - The current div index shown
 * @param {Number} recordIndex - The current record index shown
 */
function setActiveRecord(popupId, index, recordIndex) {
  logger.debug(`Setting active record to ${index}...`);
  recordIndex = recordIndex || index;
  let activeEl = document.querySelector(`#${popupId} .record-data.active`);
  _removeClass(activeEl, 'active');
  let recordDataEls = document.querySelectorAll(`#${popupId} .record-data`)
  if (recordDataEls.length >= index + 1) {
    _addClass(recordDataEls[index], 'active');
  }
  document.querySelector(`#${popupId} .record-index`).textContent = recordIndex + 1;
}

/**
 * Returns the expression from the popup UI.
 * @param {String} popupId - The popup id
 */
function getExpression(popupId) {
  return document.querySelector(`#${popupId} .filter-expression`).value;
}

/**
 * Adds the filtered icon to the result total
 * @param {String} popupId - The popup id
 */
function appliedFilter(popupId) {
  let filtersAppliedEl = document.querySelector(`#${popupId} .filters-applied`);
  _show(filtersAppliedEl);
}

/**
 * Removes the filtered icon from the result total
 * @param {String} popupId - The popup id
 */
function removedFilter(popupId) {
  let filtersAppliedEl = document.querySelector(`#${popupId} .filters-applied`);
  _hide(filtersAppliedEl);
}

function clearExpression(popupId) {
  document.querySelector(`#${popupId} .filter-expression`).value = '';
}

// #endregion Public Functions

//////////////////////////////
// Private Functions
//////////////////////////////

// #region

function _toggleClass(element, toggleClass) {
  if (!element) { return; }
  let currentClass = element.className;
  let newClass;
  if (currentClass.split(' ').indexOf(toggleClass) > -1) { // has class
    newClass = currentClass.replace(new RegExp('\\b' + toggleClass + '\\b', 'g'), '')
  } else {
    newClass = currentClass + ' ' + toggleClass;
  }
  element.className = newClass.trim();
}

function _removeClass(element, className) {
  if (!element) { return; }
  let classes = element.className.split(' ');
  let classIndex = classes.indexOf(className);
  if (classIndex >= 0) {
    classes.splice(classIndex, 1);
  }
  element.className = classes.join(' ');
}

function _addClass(element, className) {
  if (!element) { return; }
  let classes = element.className.split(' ');
  if (classes.indexOf(className) >= 0) {
    return;
  }

  element.className += ' ' + className;
}

function _show(element) {
  if (!element) { return; }
  if (element.tagName === 'SPAN') {
    element.style.display = 'inline';
  } else {
    element.style.display = 'block';
  }
}

function _hide(element) {
  if (!element) { return; }
  element.style.display = 'none';
}

// #endregion Private Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default {
  appliedFilter,
  clearExpression,
  getActiveIndex,
  getExpression,
  hideLoading,
  noResultsFound,
  removedFilter,
  setActiveRecord,
  showResultCount,
  showLoading,
  toggleView
}

// #endregion Module Exports
