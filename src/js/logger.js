/* global ENV_TESTING */
let testing = false;
let logging = true;
if (typeof ENV_TESTING !== 'undefined' && ENV_TESTING === true) {
  testing = true;
}

function disableLogging() {
  logging = false;
}

function enableLogging() {
  logging = true;
}

function log(...args) {
  if (!testing && logging) {
    console.log(...args);
  }
}

function warn(...args) {
  if (!testing && logging) {
    console.warn(...args);
  }
}

function error(...args) {
  if (!testing && logging) {
    console.error(...args);
  }
}

function debug(...args) {
  if (!testing && logging) {
    console.debug(...args);
  }
}

export default {
  disableLogging,
  enableLogging,
  log,
  warn,
  error,
  debug
};
