/* global describe it */

const chai = require('chai');
const chaiAsPromsied = require('chai-as-promised');

chai.use(chaiAsPromsied);
const should = chai.should();

const state = require('./../test-output/kickbox.identifyState');
const kb = require('./../test-output/kickbox');
const helper = require('./test.helper');
const td = require('testdouble');

describe('Identify State', () => {
  describe('#disableIdentifyByPointMode', () => {
    let mapOptions = helper.mockInitMapOptions();

    it('should disable the mode', () => {
      let identifyOptions = {
        MapboxDraw: helper.mockMapboxDraw(),
        mapboxgl: helper.mockMapboxGl(),
        tableName: 'Who you gonna call?',
        kineticaUrl: 'Ghostbusters',
        layerId: 'Spengler',
        xAttr: 'Stanz',
        yAttr: 'Venkman'
      };

      return kb.initMap(mapOptions).then(map => {
        let fired = false;
        state.modes.Spengler = helper.mockIdentifyMode(identifyOptions)
        td.replace(state.modes.Spengler, 'disableMode');
        td.when(state.modes.Spengler.disableMode())
          .thenDo(function() { fired = true; });
        state.disableIdentifyMode(map);

        fired.should.equal(true);
        should.equal(state.modes.Spengler, null);
      });
    });

    it('should remove the control', () => {
      let identifyOptions = {
        MapboxDraw: helper.mockMapboxDraw(),
        mapboxgl: helper.mockMapboxGl(),
        tableName: 'Who you gonna call?',
        kineticaUrl: 'Ghostbusters',
        layerId: 'Spengler',
        xAttr: 'Stanz',
        yAttr: 'Venkman'
      };
      return kb.initMap(mapOptions).then(map => {
        let fired = false;
        state.modes.Spengler = helper.mockIdentifyMode(identifyOptions)
        state.controls.Spengler = helper.mockIdentifyControl(identifyOptions)
        td.replace(map, 'removeControl');
        td.when(map.removeControl(state.controls.Spengler))
          .thenDo(function() { fired = true; });

        state.disableIdentifyMode(map);

        fired.should.equal(true);
        should.equal(state.controls.Spengler, null);
      });
    });
  });
});
