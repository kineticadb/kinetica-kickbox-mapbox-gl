/* global describe it */

// const td = require('testdouble');
// const lodash = require('lodash');

const chai = require('chai');
const chaiAsPromsied = require('chai-as-promised');

chai.use(chaiAsPromsied);
const should = chai.should();

const identify = require('./../test-output/kickbox.identifyByRadius');
const kb = require('./../test-output/kickbox');
const helper = require('./test.helper');
const td = require('testdouble');

describe('Identify by Radius Module', () => {
  describe('#enableIdentifyByRadiusMode', () => {
    let mapOptions = helper.mockInitMapOptions();

    it('should add the mode to the modules list of modes', () => {
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
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        let mode = identify._identifyByRadius_spec.modes.Spengler
        mode.should.be.a('Object');
        mode.should.have.property('xAttr').and.equal(identifyOptions.xAttr);
        mode.should.have.property('yAttr').and.equal(identifyOptions.yAttr);
      });
    });

    it('should accept a geoAttr in place of x/y columns', () => {
      let identifyOptions = {
        MapboxDraw: helper.mockMapboxDraw(),
        mapboxgl: helper.mockMapboxGl(),
        tableName: 'Who you gonna call?',
        kineticaUrl: 'Ghostbusters',
        layerId: 'Spengler',
        geoAttr: 'Slimer'
      };
      return kb.initMap(mapOptions).then(map => {
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        let mode = identify._identifyByRadius_spec.modes.Spengler;
        mode.should.be.a('Object');
        mode.should.have.property('geoAttr').and.equal(identifyOptions.geoAttr);
      });
    });

    it('should add the control to the identify by radius control registry', () => {
      let identifyOptions = {
        MapboxDraw: helper.mockMapboxDraw(),
        mapboxgl: helper.mockMapboxGl(),
        tableName: 'Who you gonna call?',
        kineticaUrl: 'Ghostbusters',
        layerId: 'Spengler',
        geoAttr: 'Slimer'
      };
      return kb.initMap(mapOptions).then(map => {
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        let control = identify._identifyByRadius_spec.controls.Spengler;

        control.should.be.a('Object');
      });
    });

    it('should not allow two identify by radius modes to be turned on simultaneously', () => {
      let identifyOptions = {
        MapboxDraw: helper.mockMapboxDraw(),
        mapboxgl: helper.mockMapboxGl(),
        tableName: 'Who you gonna call?',
        kineticaUrl: 'Ghostbusters',
        layerId: 'Spengler',
        geoAttr: 'Slimer'
      };
      return kb.initMap(mapOptions).then(map => {
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        identify._identifyByRadius_spec.controls.Spengler.should.be.a('Object');

        identifyOptions.layerId = 'Zuul';
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        should.equal(identify._identifyByRadius_spec.controls.Spengler, null);
      });
    });

    it('should add the control to the map', () => {
      let identifyOptions = {
        MapboxDraw: helper.mockMapboxDraw(),
        mapboxgl: helper.mockMapboxGl(),
        tableName: 'Who you gonna call?',
        kineticaUrl: 'Ghostbusters',
        layerId: 'Spengler',
        geoAttr: 'Slimer'
      };
      return kb.initMap(mapOptions).then(map => {
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        map.controls.should.have.lengthOf(1);
      });
    });
  });

  describe('#disableIdentifyByRadiusMode', () => {
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
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        td.replace(identify._identifyByRadius_spec.modes.Spengler, 'disableMode');
        td.when(identify._identifyByRadius_spec.modes.Spengler.disableMode())
          .thenDo(function() { fired = true; });

        identify.disableIdentifyByRadiusMode(map);

        fired.should.equal(true);
        should.equal(identify._identifyByRadius_spec.modes.Spengler, null);
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
        identify.enableIdentifyByRadiusMode(map, identifyOptions);
        td.replace(map, 'removeControl');
        td.when(map.removeControl(identify._identifyByRadius_spec.controls.Spengler))
          .thenDo(function() { fired = true; });

        identify.disableIdentifyByRadiusMode(map);

        fired.should.equal(true);
        should.equal(identify._identifyByRadius_spec.controls.Spengler, null);
      });
    });
  });
});
