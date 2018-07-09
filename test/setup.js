if (typeof Promise !== 'function') {
  global.Promise = require('bluebird');
}

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let dom = new JSDOM('');
global.window = dom.window;
global.document = dom.window.document;

global.navigator = {
  userAgent: 'node.js'
};

global.btoa = function (str) {
  return Buffer.from(str).toString('base64');
};
