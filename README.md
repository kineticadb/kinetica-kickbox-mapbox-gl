# Kinetica Kickbox.js for Mapbox GL

## Library Overview
Kinetica Kickbox.js is a client-side code-acellerator library aimed at getting you up and running with Kinetica and Mapbox GL as quickly as possible.

## Features

Specifically, this library provides common helper functions that make it easier to implement:

- WMS Layers
    - Raster Layers
    - Heatmap Layers
    - CB Raster Layers
    - Labels Layers
    - Contour Layers
- Geohashed Point Cluster Layers
- Feature Identification workflows

## Why is a library needed?

While Mapbox is fully interoperable with Kinetica natively, the workflow for displaying Kinetica's WMS layers can be tricky to implement without knowing the best practices regarding their integration. Furthermore, there are common patterns that begin to emerge and this library aims to reduce the amount of code required to simply connect Kinetica's WMS output to Mapbox.

## Installation

### Installing Kickbox in Your Project

Add this line to your package.json file:

```
  "dependencies": {
  ...
    "kickbox": "kinetica/kinetica-kickbox-mapbox-gl"
  ...
```

Then run `npm install`.

Once it's in your node_modules folder, you can either reference the `node_modules/kinetica-kickbox-mapbox-gl/dist/kickbox.min.js` directly from your index.html, or use something like `var kickbox = require('kinetica-kickbox-mapbox-gl');` in your JavaScript framework.

## Getting Started

- [API](./docs/api.md)
- [WMS Layers](./docs/wms.md)
- [Point Clustering](./docs/point-clustering.md)
