# Kinetica Kickbox.js

## Library Overview
Kinetica Kickbox.js is a set of client-side code-acellerator libraries aimed at getting you up and running with Kinetica and Mapbox GL as quickly as possible.

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

## Getting Started

### Installing Kickbox in Your Project

If you're using NPM, add this line to your package manager:

```
  "dependencies": {
  ...
    "kickbox": "kinetica/kinetica-kickbox-mapbox-gl"
  ...
```

Then run `npm install`.

Or from your CLI, simply run:

```
npm install --save kinetica-kickbox-mapbox-gl
```

Once it's in your node_modules folder, you can either reference the `node_modules/kinetica-kickbox/dist/kickbox.js` directly from your index.html, or use something like `var kickbox = require('kinetica-kickbox');` in your JavaScript framework.

If you're not using a package manager, you can grab a copy of Kinetica Kickbox.js from our GitHub page here: http://github.com/kinetica/kickboxjs. TODO: Put real link here

## Getting Started

- [API](./docs/api.md)
- [WMS Layers](./docs/wms.md)
- [Point Clustering](./docs/point-clustering.md)

