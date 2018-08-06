/* global describe it */

// const td = require('testdouble');
// const lodash = require('lodash');

const chai = require('chai');
const chaiAsPromsied = require('chai-as-promised');

chai.use(chaiAsPromsied);
const should = chai.should();

const identify = require('./../test-output/kickbox.identifyByPoint');
const kb = require('./../test-output/kickbox');
const helper = require('./test.helper');

describe('Identify by Radius Module', () => {
  describe('#enableIdentifyByPointMode', () => {
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
        identify.enableIdentifyByPointMode(map, identifyOptions);
        let mode = identify._identifyByPoint_spec.modes.Spengler
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
        identify.enableIdentifyByPointMode(map, identifyOptions);
        let mode = identify._identifyByPoint_spec.modes.Spengler;
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
        identify.enableIdentifyByPointMode(map, identifyOptions);
        let control = identify._identifyByPoint_spec.controls.Spengler;

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
        identify.enableIdentifyByPointMode(map, identifyOptions);
        identify._identifyByPoint_spec.controls.Spengler.should.be.a('Object');

        identifyOptions.layerId = 'Zuul';
        identify.enableIdentifyByPointMode(map, identifyOptions);
        should.equal(identify._identifyByPoint_spec.controls.Spengler, null);
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
        identify.enableIdentifyByPointMode(map, identifyOptions);
        map.controls.should.have.lengthOf(1);
      });
    });
  });
});
