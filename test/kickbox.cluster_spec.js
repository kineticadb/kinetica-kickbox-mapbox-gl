/* global describe it beforeEach afterEach */

const td = require('testdouble');
const lodash = require('lodash');

const cluster = require('./../test-output/kickbox.cluster');
const kb = require('./../test-output/kickbox');
const testHelper = require('./test.helper');

describe('Cluster Module', () => {
  let any;
  beforeEach(() => {
    any = td.matchers.anything;
  });

  describe('#addClusterLayer', () => {
    let map;
    beforeEach(() => {
      map = testHelper.mockMap();
    });

    afterEach(() => {
      td.reset();
    });

    it('should trigger before/after events', () => {
      let beforeAdded = false;
      let afterAdded = false;
      kb.on('beforeClusterLayerAdded', () => { beforeAdded = true; });
      kb.on('afterClusterLayerAdded', () => { afterAdded = true; });

      td.replace(kb._spec.cluster, 'addClusterLayer');
      td.when(kb._spec.cluster.addClusterLayer(any(), any()))
        .thenResolve({land: 'speeder'});

      beforeAdded.should.equal(false);
      afterAdded.should.equal(false);

      return kb.addClusterLayer(map, {layerId: 'tatooine'}).then(results => {
        beforeAdded.should.equal(true);
        afterAdded.should.equal(true);
      });
    });

    it('should load cluster features from kinetica', () => {
      let featureResult = [{feature: 'jawa'}];
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {}).then(results => {
        results.features.should.deep.equal(featureResult);
      });
    });

    it('should set and use defaults if not passed into options', () => {
      let featureResult = [{feature: 'jawa'}];
      let defaultOptions = {
        clusterRadius: 40,
        clusterMaxZoom: 14,
        clientAggregations: [],
        labelColor: '#000000',
        labelHaloColor: '#FFFFFF',
        minSize: 1,
        maxSize: 20,
        minColor: '#FF0000',
        maxColor: '#00FF00'
      };
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {}).then(results => {
        results.options.should.deep.equal(defaultOptions);
      });
    });

    it('should add a source to the map for the cluster layer', () => {
      let featureResult = [{feature: 'jawa'}];
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {layerId: 'tatooine'}).then(results => {
        let layer = lodash.find(results.map.layers, layer => layer.id === 'tatooine-layer');
        layer.should.be.a('object').and.have.property('id').and.equal('tatooine-layer');
      });
    });

    it('should add a layer to the map for the cluster layer', () => {
      let featureResult = [{feature: 'jawa'}];
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {layerId: 'tatooine'}).then(results => {
        let source = lodash.find(results.map.sources, source => source.id === 'tatooine-source');
        source.should.be.a('object').and.have.property('id').and.equal('tatooine-source');
      });
    });

    it('should add a labels layer to the map for the cluster layer', () => {
      let featureResult = [{feature: 'jawa'}];
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {layerId: 'tatooine'}).then(results => {
        let layer = lodash.find(results.map.layers, layer => layer.id === 'tatooine-labels-layer');
        layer.should.be.a('object').and.have.property('id').and.equal('tatooine-labels-layer');
      });
    });

    it('should register an update function to fire on every zoomend and drag end', () => {
      let featureResult = [{feature: 'jawa'}];
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {layerId: 'tatooine'}).then(results => {
        results.map._listeners.zoomend.should.be.a('array').and.have.property('length').and.be.greaterThan(0);
      });
    });

    it('should register a popup function when clicking on a circle or label', () => {
      let featureResult = [{feature: 'jawa'}];
      td.replace(cluster, '_loadClusterFeatures');
      td.when(cluster._loadClusterFeatures(any(), any()))
        .thenResolve(featureResult);

      return cluster.addClusterLayer(map, {layerId: 'tatooine'}).then(results => {
        results.map._listeners.click.should.be.a('array').and.have.property('length').and.equal(2);
      });
    });
  });

  describe('#initClusterLayer', () => {
    afterEach(() => {
      td.reset();
    });

    it('should add a default aggregation for the total cluster sum', () => {
      let aggregations = cluster.initCluster([], 40, 20, []).aggregations;
      let subject = lodash.find(aggregations, agg => agg.key === 'clusterTotalSum');

      subject.should.be.a('object');
      subject.should.have.property('key').and.equal('clusterTotalSum');
      subject.should.have.property('initial').and.equal(0);
      subject.should.have.property('map').and.be.a('function');
      subject.should.have.property('reduce').and.be.a('function');
    });

    it('should add a default aggregation for the localized total cluster sum', () => {
      let aggregations = cluster.initCluster([], 40, 20, []).aggregations;
      let subject = lodash.find(aggregations, agg => agg.key === 'clusterTotalSumLocalized');

      subject.should.be.a('object');
      subject.should.have.property('key').and.equal('clusterTotalSumLocalized');
      subject.should.have.property('initial').and.equal(0);
      subject.should.have.property('reduce').and.be.a('function');
    });

    it('should add a default aggregation for the smallest cluster size', () => {
      let aggregations = cluster.initCluster([], 40, 20, []).aggregations;
      let subject = lodash.find(aggregations, agg => agg.key === 'smallestClusterSize');

      subject.should.be.a('object');
      subject.should.have.property('key').and.equal('smallestClusterSize');
      subject.should.have.property('initial').and.equal(0);
      subject.should.have.property('map').and.be.a('function');
      subject.should.have.property('reduce').and.be.a('function');
    });

    it('should add a default aggregation for the largest cluster size', () => {
      let aggregations = cluster.initCluster([], 40, 20, []).aggregations;
      let subject = lodash.find(aggregations, agg => agg.key === 'largestClusterSize');

      subject.should.be.a('object');
      subject.should.have.property('key').and.equal('largestClusterSize');
      subject.should.have.property('initial').and.equal(0);
      subject.should.have.property('map').and.be.a('function');
      subject.should.have.property('reduce').and.be.a('function');
    });
  });

  describe('#updateClusters', () => {
    let superCluster, map;
    beforeEach(() => {
      superCluster = testHelper.mockSuperCluster();
      map = testHelper.mockMap();
    });

    it('should calculate the min and max cluster size for the given view', () => {
      map.addSource({id: 'cluster-source'});
      map.addLayer({name: 'cluster-layer'});

      let subject = cluster.updateClusters(map, 'cluster-source', 'cluster-layer', superCluster, 40, 0, 20, '#FF000', '#00FF000').minMax;

      subject.should.have.property('min').and.equal(0);
      subject.should.have.property('max').and.equal(100);
    });

    it('should set the radius paint property', () => {
      map.addSource({id: 'cluster-source'});
      map.addLayer({name: 'cluster-layer'});
      let results = cluster.updateClusters(map, 'cluster-source', 'cluster-layer', superCluster, 40, 0, 20, '#FF000', '#00FF000');

      let subject = results.map._paintProperties;

      subject.should.have.property('circle-radius').and.be.a('object');
    });

    it('should set the color paint property', () => {
      map.addSource({id: 'cluster-source'});
      map.addLayer({name: 'cluster-layer'});
      let results = cluster.updateClusters(map, 'cluster-source', 'cluster-layer', superCluster, 40, 0, 20, '#FF000', '#00FF000');

      let subject = results.map._paintProperties;

      subject.should.have.property('circle-color').and.be.a('object');
    });
  });
});
