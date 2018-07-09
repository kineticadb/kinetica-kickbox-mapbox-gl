/* global describe it beforeEach afterEach */

const td = require('testdouble');
const lodash = require('lodash');

const kb = require('./../test-output/kickbox');
const testHelper = require('./test.helper');

describe('Raster Module', () => {
  describe('#addWmsLayer for rasters', () => {
    let mapOptions;
    beforeEach(() => {
      mapOptions = testHelper.mockInitMapOptions();
    });

    afterEach(() => {
      td.reset();
    });

    it('should trigger before/after events', () => {
      let beforeAdded = false;
      let afterAdded = false;

      return kb.initMap(mapOptions).then(map => {
        kb.on('beforeWmsLayerAdded', () => { beforeAdded = true; });
        kb.on('afterWmsLayerAdded', () => { afterAdded = true; });
        let options = {
          layerType: 'raster',
          layerId: 'kessel-run',
          tableName: 'millenium-falcon'
        };

        kb.addWmsLayer(map, options)
        beforeAdded.should.equal(true);
        afterAdded.should.equal(true);
      });
    });

    it('should add the required basic layer parameters', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.should.have.property('layerParams');
        result.layerParams.should.have.property('format').and.equal('image/png');
        result.layerParams.should.have.property('service').and.equal('WMS');
        result.layerParams.should.have.property('version').and.equal('1.1.1');
        result.layerParams.should.have.property('request').and.equal('GetMap');
        result.layerParams.should.have.property('srs').and.equal('EPSG:3857');
        result.layerParams.should.have.property('layers').and.equal(options.tableName);
        result.layerParams.should.have.property('STYLES').and.equal('raster');
        result.layerParams.should.have.property('USE_POINT_RENDERER').and.equal(true);
      });
    });

    it('should assign default values for rendering options not passed to the function', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('STYLES').and.equal('raster');
        result.layerParams.should.have.property('USE_POINT_RENDERER').and.equal(true);
        result.layerParams.should.have.property('DOPOINTS').and.equal(true);
        result.layerParams.should.have.property('DOSHAPES').and.equal(true);
        result.layerParams.should.have.property('POINTCOLORS').and.equal('FF0000');
        result.layerParams.should.have.property('POINTSIZES').and.equal(3);
        result.layerParams.should.have.property('POINTSHAPES').and.equal('circle');
      });
    });

    it('should allow all applicable rendering options to be customized', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        renderingOptions: {
          POINTCOLORS: '00FF00',
          POINTSIZES: '20',
          POINTSHAPES: 'triangles'
        }
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('POINTCOLORS').and.equal('00FF00');
        result.layerParams.should.have.property('POINTSIZES').and.equal('20');
        result.layerParams.should.have.property('POINTSHAPES').and.equal('triangles');
      });
    });

    it('should allow and assign x/y column names', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        xAttr: 'Lon',
        yAttr: 'Lat'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('X_ATTR').and.equal(options.xAttr);
        result.layerParams.should.have.property('Y_ATTR').and.equal(options.yAttr);
      });
    });

    it('should allow and assign wkt column name', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        geoAttr: 'wkt'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('GEO_ATTR').and.equal(options.geoAttr);
      });
    });

    it('should only use x/y or wkt columns, but not both', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        geoAttr: 'WKT',
        xAttr: 'Lon',
        yAttr: 'Lat'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.not.have.property('GEO_ATTR');
        result.layerParams.should.have.property('X_ATTR').and.equal(options.xAttr);
        result.layerParams.should.have.property('Y_ATTR').and.equal(options.yAttr);
      });
    });

    it('should add the layer and source to the map', () => {
      let options = {
        layerType: 'raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        geoAttr: 'wkt'
      };

      return kb.initMap(mapOptions).then(map => {
        kb.addWmsLayer(map, options);
        let foundSource = lodash.find(map.sources, source => source.id === 'kessel-run-source');
        let foundLayer = lodash.find(map.layers, layer => layer.id === 'kessel-run-layer');

        foundSource.should.be.a('object');
        foundSource.should.have.property('id').and.equal('kessel-run-source');
        foundLayer.should.be.a('object');
        foundLayer.should.have.property('id').and.equal('kessel-run-layer');
      });
    });
  });
});
