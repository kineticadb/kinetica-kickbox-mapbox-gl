/* global ENV_TESTING */

//////////////////////////////
// Imported Modules
//////////////////////////////

// #region

import findIndex from 'lodash/findIndex';

const lodash = { findIndex };

// #endregion Imported Modules

//////////////////////////////
// Private Vars
//////////////////////////////

// #region

let _listeners = {};

// #endregion Private Vars

//////////////////////////////
// Public Functions
//////////////////////////////

// #region

/**
 * Registers a callback for an event name.
 * @param {String} name - The name of the event
 * @param {Function} cb - The callback to fire
 */
function register(name, cb) {
  if (!_listeners[name]) {
    _listeners[name] = [];
  }

  _listeners[name].push(cb);
}

/**
 * Unregisters a callback from the passed event name.
 * @param {String} name - The name of the event
 * @param {Function} cb - The name of the callback.
 */
function unregister(name, cb) {
  let index = _listeners[name].indexOf(cb);
  if (index > -1) {
    _listeners[name].splice(index, 1);
  }

  if (_listeners[name].length === 0) {
    delete _listeners[name];
  }
}

/**
 * Unregisters a callback function by passed ID instead of
 * the function itself. Function must have a kbFnId parameter
 * containing the passed id.
 * @param {String} name - The name of the event
 * @param {String} cbId - The ID of the callback
 */
function unregisterById(name, cbId) {
  let index = lodash.findIndex(_listeners[name], f => { return f.kbFnId === cbId; });
  if (index > -1) {
    _listeners[name].splice(index, 1);
  }

  if (_listeners[name].length === 0) {
    delete _listeners[name];
  }
}

/**
 * Triggers a kickbox event for all listeners based on the passed event name.
 * @param {String} name - The name of the event to trigger
 */
function trigger(name) {
  if (_listeners[name]) {
    for (var i = 0; i < _listeners[name].length; i++) {
      _listeners[name][i]({eventName: name});
    }
  }
}

// #endregion Public Functions

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

let mod = {
  register,
  trigger,
  unregister,
  unregisterById
}

// TODO: Come up with a cleaner solution to replace modules in tests
if (typeof ENV_TESTING !== 'undefined' && ENV_TESTING === true) {
  mod._spec = {
    clearListeners: () => { _listeners = {}; },
    getListeners: () => { return _listeners; }
  }
}

export default mod;

// #endregion Module Exports
