/* global describe it beforeEach afterEach */

const td = require('testdouble');
const lodash = require('lodash');

const kb = require('./../test-output/kickbox');
const testHelper = require('./test.helper');

describe('Contour Module', () => {
  describe('#addWmsLayer for contours', () => {
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
          layerType: 'contour',
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
        layerType: 'contour',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.should.have.property('layerParams');
        result.layerParams.should.have.property('COLORMAP').and.equal('jet');
        result.layerParams.should.have.property('MIN_LEVEL').and.equal(1);
        result.layerParams.should.have.property('MAX_LEVEL').and.equal(1);
        result.layerParams.should.have.property('VAL_ATTR').and.equal('z');
        result.layerParams.should.have.property('SEARCH_RADIUS').and.equal(1);
        result.layerParams.should.have.property('GRIDDING_METHOD').and.equal('INV_DST_POW');
        result.layerParams.should.have.property('RENDER_OUTPUT_GRID').and.equal(0);
        result.layerParams.should.have.property('GRID_ROWS').and.equal(100);
        result.layerParams.should.have.property('GRID_COLUMNS').and.equal(-1);
      });
    });

    it('should assign default values for rendering options not passed to the function', () => {
      let options = {
        layerType: 'contour',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon'
      };

      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('STYLES').and.equal('contour');
        result.layerParams.should.have.property('COLORMAP').and.equal('jet');
        result.layerParams.should.have.property('MIN_LEVEL').and.equal(1);
        result.layerParams.should.have.property('MAX_LEVEL').and.equal(1);
        result.layerParams.should.have.property('VAL_ATTR').and.equal('z');
        result.layerParams.should.have.property('SEARCH_RADIUS').and.equal(1);
        result.layerParams.should.have.property('GRIDDING_METHOD').and.equal('INV_DST_POW');
        result.layerParams.should.have.property('RENDER_OUTPUT_GRID').and.equal(0);
        result.layerParams.should.have.property('GRID_ROWS').and.equal(100);
        result.layerParams.should.have.property('GRID_COLUMNS').and.equal(-1);
      });
    });

    it('should allow all applicable rendering options to be customized', () => {
      let options = {
        layerType: 'contour',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        renderingOptions: {
          COLORMAP: 'viridis',
          MIN_LEVEL: 10,
          MAX_LEVEL: 20
        }
      };
      return kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('COLORMAP').and.equal('viridis');
        result.layerParams.should.have.property('MIN_LEVEL').and.equal(10);
        result.layerParams.should.have.property('MAX_LEVEL').and.equal(20);
      });
    });

    it('should allow and assign x/y column names', () => {
      let options = {
        layerType: 'contour',
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
        layerType: 'contour',
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
        layerType: 'contour',
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
        layerType: 'contour',
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
