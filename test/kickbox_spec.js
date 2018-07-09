/* global describe it beforeEach afterEach */
const chai = require('chai');
const chaiAsPromsied = require('chai-as-promised');
const td = require('testdouble');

chai.use(chaiAsPromsied);
chai.should();

const kb = require('./../test-output/kickbox');
const helper = require('./test.helper');

describe('kickbox', () => {
  let any;
  beforeEach(() => {
    any = td.matchers.anything;
  });

  describe('API', () => {
    afterEach(() => { td.reset(); })

    it('should expose its own API', () => {
      kb.should.have.property('initMap').and.be.a('function');
      kb.should.have.property('removeLayer').and.be.a('function');
      kb.should.have.property('removeSource').and.be.a('function');
      kb.should.have.property('updateWmsLayer').and.be.a('function');
      kb.should.have.property('updateWmsLayerType').and.be.a('function');
      kb.should.have.property('zoomToBounds').and.be.a('function');
    });

    describe('Sub-Module APIs', () => {
      it('should expose the API of the cluster sub-module', () => {
        kb.should.have.property('addClusterLayer').and.be.a('function');
      });

      it('should expose the API of the cluster sub-module', () => {
        kb.should.have.property('addCbLegend').and.be.a('function');
      });

      it('should expose the API of the identifyByRadius sub-module', () => {
        kb.should.have.property('disableIdentifyByRadiusMode').and.be.a('function');
        kb.should.have.property('enableIdentifyByRadiusMode').and.be.a('function');
      });

      it('should expose the API of the identifyByPoint sub-module', () => {
        kb.should.have.property('disableIdentifyByPointMode').and.be.a('function');
        kb.should.have.property('enableIdentifyByPointMode').and.be.a('function');
      });
    });
  });

  describe('Public Functions', () => {
    describe('#initMap', () => {
      let mapboxgl;

      afterEach(() => {
        td.reset();
      });

      beforeEach(() => {
        // Stub out mapboxgl
        mapboxgl = {};
        mapboxgl.accessToken = null;
      });

      it('should set the map params with which to to init the map', () => {
        let options = helper.mockInitMapOptions();
        options.mapboxKey = 'Obi-Wan';
        options.mapDiv = 'Lobot';
        options.mapStyle = 'Lando';
        options.zoom = 'Boba';
        options.center = 'Chewie';

        return kb.initMap(options).then(subject => {
          subject.should.have.property('container').and.equal(options.mapDiv);
          subject.should.have.property('style').and.equal(options.mapStyle);
          subject.should.have.property('zoom').and.equal(options.zoom);
          subject.should.have.property('center').and.equal(options.center);
        });
      });

      it('should set defaults if no options are provided for optional parameters', () => {
        let options = helper.mockInitMapOptions();
        delete options.mapStyle;
        delete options.zoom;
        delete options.center;

        return kb.initMap(options).then(subject => {
          subject.should.have.property('style').and.equal('mapbox://styles/mapbox/dark-v9');
          subject.should.have.property('zoom').and.equal(4);
          subject.should.have.property('center').and.deep.equal([ -3.8199625, 40.4378693 ]);
        });
      });

      it('should set basic auth parameters on the map request transformer function', () => {
        let options = helper.mockInitMapOptions()
        let url = 'http://www.starwars.com';
        options.wmsUrl = url;
        let resourceType = 'Image';

        return kb.initMap(options).then(map => {
          let subject = map.transformRequest(url, resourceType);

          subject.should.have.property('url').and.equal(url);
          subject.should.have.property('headers')
            .and.have.property('Authorization')
            .and.match(/Basic [A-Za-z0-9]*==/);
        });
      });

      // TODO: Find a way to test the axios interceptor
      it('should set an auth interceptor in the async http request library it uses', () => {
        let options = helper.mockInitMapOptions();
        options.username = 'vader';
        options.password = 'emporer';

        return kb.initMap(options).then(() => {
          let interceptor = kb._spec.axios.interceptors.request.handlers[0].fulfilled;

          let subject = interceptor({auth: {}});

          subject.should.have.property('auth').and.be.a('object');
          subject.auth.should.have.property('username').and.equal(options.username);
          subject.auth.should.have.property('password').and.equal(options.password);
        });
      });
    });

    describe('#updateWmsLayer', () => {
      let map;
      beforeEach(() => {
        map = {
          _listeners: {
            moveend: [],
            zoomend: []
          }
        };
        map.getSource = () => { return {url: 'http://www.starwars.com/wms?param1=value1&param2=value2'}; };
        map.on = (eName, fn) => {
          map._listeners[eName].push(fn);
          return map;
        }
      });
      afterEach(() => {
        td.reset();
      });

      it('should update the query parameters for the WMS call', () => {
        let kinetiaUrl = 'http://www.starwars.com';
        let layerId = 'Jakku';
        let renderingOptions = {param1: 'finn', param2: 'rey'};
        td.replace(kb._spec.helper, 'setSourceParams');

        let subject = kb.updateWmsLayer(map, {kinetiaUrl, layerId, renderingOptions}).queryParams;

        subject.should.have.property('param1').and.equal(renderingOptions.param1);
        subject.should.have.property('param2').and.equal(renderingOptions.param2);
      });

      it('should rebind the redraw event listeners to use the new query parameters', () => {
        let kinetiaUrl = 'http://www.starwars.com';
        let layerId = 'Jakku';
        let renderingOptions = {param1: 'finn', param2: 'rey'};
        td.replace(kb._spec.helper, 'setSourceParams');
        kb.updateWmsLayer(map, {kinetiaUrl, layerId, renderingOptions});
        map._listeners.zoomend[0].identifier = 'OLD';
        map._listeners.moveend[0].identifier = 'OLD';

        map._listeners.zoomend[0].should.have.property('identifier').and.equal('OLD');
        map._listeners.moveend[0].should.have.property('identifier').and.equal('OLD');

        kb.updateWmsLayer(map, {kinetiaUrl, layerId, renderingOptions});

        map._listeners.zoomend[0].should.not.have.property('identifier');
        map._listeners.moveend[0].should.not.have.property('identifier');
      });
    });

    describe('#updateWmsLayerType', () => {
      let mapOptions, layerOptions;

      beforeEach(() => {
        mapOptions = helper.mockInitMapOptions();
        layerOptions = {
          wmsUrl: 'http://www.starwars.com',
          layerType: 'raster',
          layerId: 'kessel-run',
          tableName: 'millenium-falcon',
          geoAttr: 'mahWkt'
        };
      });

      afterEach(() => {
        td.reset();
      });

      it('should error if source is not found', () => {
        return kb.initMap(mapOptions).then(map => {
          let layerId = 'tatooine';
          let layerType = 'heatmap';
          let subject = kb.updateWmsLayerType(map, layerId, layerType);

          subject.should.be.a('error');
        });
      });

      it('should accept an optional debounce limit', () => {
        return kb.initMap(mapOptions).then(map => {
          let layerId = 'kessel-run';
          let layerType = 'heatmap';
          let deboucneLimit = 400;
          kb.addWmsLayer(map, layerOptions);

          let subject = kb.updateWmsLayerType(map, layerId, layerType, deboucneLimit);

          subject.should.have.property('debounceLimit').and.equal(400);
        });
      });

      it('should return the rebound function', () => {
        return kb.initMap(mapOptions).then(map => {
          let layerId = 'kessel-run';
          let layerType = 'heatmap';
          let deboucneLimit = 400;
          kb.addWmsLayer(map, layerOptions);

          let subject = kb.updateWmsLayerType(map, layerId, layerType, deboucneLimit);

          subject.should.have.property('redraw').and.be.a('function');
        });
      });
    });

    describe('#setLayerOpacity', () => {
      it('should call the appropriate API call with the passed parameters', () => {
        let layerId = 'greedo';
        let styleProperty = 'raster-opacity';
        let opacity = 'jabba';
        let map = {setPaintProperty: (a, b, c) => {
          a.should.equal(layerId + '-layer');
          b.should.equal(styleProperty);
          c.should.equal(opacity);
        }}
        kb.setLayerOpacity(map, layerId, opacity);
      });
    });

    describe('#zoomToBounds', () => {
      let map;
      afterEach(() => {
        map = {fitBounds: (bounds, opts) => { return {bounds, opts}; }};
        td.reset();
      });

      it('should get the geospatial boundary of the passed table', () => {
        let options = {};
        td.replace(kb._spec.helper, 'getTableBoundary');
        td.when(kb._spec.helper.getTableBoundary(td.matchers.anything()))
          .thenResolve({carbonite: 'is cold'});

        let subject = kb.zoomToBounds(map, options);

        return subject.should.be.fulfilled;
      });

      it('should return an error when the table boundary call fails', () => {
        let options = {};
        let errResponse = new Error({darkside: true});
        td.replace(kb._spec.helper, 'getTableBoundary');
        td.when(kb._spec.helper.getTableBoundary(td.matchers.anything()))
          .thenReject(errResponse);

        kb.zoomToBounds(map, options).should.eventually.deep.equal(errResponse);
      });

      it('should use the boundary to fit the bounds on the screen', () => {
        let options = {};
        let tableBoundaryResponse = 'empire';
        td.replace(kb._spec.helper, 'getTableBoundary');
        td.replace(map, 'fitBounds');
        td.when(kb._spec.helper.getTableBoundary(any()))
          .thenResolve(tableBoundaryResponse);
        td.when(map.fitBounds(tableBoundaryResponse, any()))
          .thenReturn('success');

        kb.zoomToBounds(map, options).should.eventually.deep.equal('success');
      });
    });
  });
});
