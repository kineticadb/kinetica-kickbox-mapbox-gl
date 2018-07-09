/* global describe it beforeEach afterEach */

const td = require('testdouble');
const lodash = require('lodash');

const kb = require('./../test-output/kickbox');
const cbRaster = require('./../test-output/kickbox.cbRaster');
const testHelper = require('./test.helper');

describe('CB Raster Module', () => {
  describe('#addWmsLayer for class break rasters', () => {
    let mapOptions;

    beforeEach(() => {
      mapOptions = testHelper.mockInitMapOptions();
    });

    afterEach(() => {
      td.reset();
    });

    it('should add the required basic layer parameters', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2'
        }
      };

      kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.should.have.property('layerParams');
        result.layerParams.should.have.property('format').and.equal('image/png');
        result.layerParams.should.have.property('service').and.equal('WMS');
        result.layerParams.should.have.property('version').and.equal('1.1.1');
        result.layerParams.should.have.property('request').and.equal('GetMap');
        result.layerParams.should.have.property('srs').and.equal('EPSG:3857');
        result.layerParams.should.have.property('layers').and.equal(options.tableName);
        result.layerParams.should.have.property('STYLES').and.equal('cb_raster');
        result.layerParams.should.have.property('USE_POINT_RENDERER').and.equal(true);
      });
    });

    it('should assign default values for rendering options not passed to the function', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2'
        }
      };

      kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('STYLES').and.equal('cb_raster');
        result.layerParams.should.have.property('POINTSHAPES').and.equal('circle');
        result.layerParams.should.have.property('POINTSIZES').and.equal('3');
        result.layerParams.should.have.property('POINTCOLORS').and.equal('FF0000');
        result.layerParams.should.have.property('ORDER_CLASSES').and.equal(true);
        result.layerParams.should.have.property('USE_POINT_RENDERER').and.equal(true);
      });
    });

    it('should allow all applicable rendering options to be customized', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2',
          POINTCOLORS: '00FF00',
          POINTSIZES: '20',
          ORDER_CLASSES: false,
          USE_POINT_RENDERER: false,
          POINTSHAPES: 'triangle'
        }
      };

      kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('USE_POINT_RENDERER').and.equal(false);
        result.layerParams.should.have.property('POINTCOLORS').and.equal('00FF00');
        result.layerParams.should.have.property('POINTSIZES').and.equal('20');
        result.layerParams.should.have.property('POINTSHAPES').and.equal('triangle');
        result.layerParams.should.have.property('ORDER_CLASSES').and.equal(false);
      });
    });

    it('should allow and assign x/y column names', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        xAttr: 'Lon',
        yAttr: 'Lat',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2'
        }
      };

      kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('X_ATTR').and.equal(options.xAttr);
        result.layerParams.should.have.property('Y_ATTR').and.equal(options.yAttr);
      });
    });

    it('should allow and assign wkt column name', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        geoAttr: 'wkt',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2'
        }
      };

      kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.have.property('GEO_ATTR').and.equal(options.geoAttr);
      });
    });

    it('should only use x/y or wkt columns, but not both', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        geoAttr: 'WKT',
        xAttr: 'Lon',
        yAttr: 'Lat',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2'
        }
      };

      kb.initMap(mapOptions).then(map => {
        let result = kb.addWmsLayer(map, options);
        result.layerParams.should.not.have.property('GEO_ATTR');
        result.layerParams.should.have.property('X_ATTR').and.equal(options.xAttr);
        result.layerParams.should.have.property('Y_ATTR').and.equal(options.yAttr);
      });
    });

    it('should add the layer and source to the map', () => {
      let options = {
        layerType: 'cb_raster',
        layerId: 'kessel-run',
        tableName: 'millenium-falcon',
        geoAttr: 'wkt',
        renderingOptions: {
          CB_ATTR: 'dianoga',
          CB_VALS: '0:1,1:2'
        }
      };

      kb.initMap(mapOptions).then(map => {
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

  describe('#validateParams', () => {
    it('should error if missing required parameters', () => {
      let subject = cbRaster.validateParams({
        CB_ATTR: 'boba_fett',
        CB_VALS: '0:1,1:2'
      }).isValid;
      subject.should.equal(false);
    });

    it('should error if arg lengths do not match between parameters', () => {
      let pointColorSubject = cbRaster.validateParams({
        CB_ATTR: 'boba_fett',
        CB_VALS: '0:1',
        POINTCOLORS: 'FFFFFF,000000',
        POINTSIZES: '2',
        POINTSHAPES: 'circle'
      }).isValid;

      pointColorSubject.should.equal(false);

      let pointSizesSubject = cbRaster.validateParams({
        CB_ATTR: 'boba_fett',
        CB_VALS: '0:1',
        POINTCOLORS: 'FFFFFF',
        POINTSIZES: '2,3',
        POINTSHAPES: 'circle'
      }).isValid;

      pointSizesSubject.should.equal(false);

      let pointShapesSubject = cbRaster.validateParams({
        CB_ATTR: 'boba_fett',
        CB_VALS: '0:1',
        POINTCOLORS: 'FFFFFF',
        POINTSIZES: '2',
        POINTSHAPES: 'circle,triangle'
      }).isValid;

      pointShapesSubject.should.equal(false);
    });

    it('should error if the class breaks are not formatted correctly', () => {
      let subject = cbRaster.validateParams({
        CB_ATTR: 'boba_fett',
        CB_VALS: '0:0,1:2',
        POINTCOLORS: 'FFFFFF',
        POINTSIZES: '2',
        POINTSHAPES: 'circle'
      }).isValid;

      subject.should.equal(false);
    });
  });

  describe('#getLayerDefaults', () => {
    it('should return the default parameters for a cb raster layer', () => {
      let subject = cbRaster.getLayerDefaults();
      let params = {
        STYLES: 'cb_raster',
        CB_ATTR: '',
        CB_VALS: '',
        ORDER_CLASSES: true,
        USE_POINT_RENDERER: true,
        POINTCOLORS: 'FF0000',
        POINTSIZES: '3',
        POINTSHAPES: 'circle'
      };

      subject.should.deep.equal(params);
    });
  });
});
