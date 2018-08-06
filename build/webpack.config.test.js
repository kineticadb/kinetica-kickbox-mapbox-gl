const path = require('path');
const webpack = require('webpack');

const config = {
  devtool: 'eval-source-map',
  entry: {
    'kickbox': './src/js/kickbox.js',
    'kickbox.cbRaster': './src/js/kickbox.cbRaster.js',
    'kickbox.cluster': './src/js/kickbox.cluster.js',
    'kickbox.events': './src/js/kickbox.events.js',
    'kickbox.identifyByRadius': './src/js/kickbox.identifyByRadius.js',
    'kickbox.identifyByPoint': './src/js/kickbox.identifyByPoint.js',
    'kickbox.identifyState': './src/js/kickbox.identifyState.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/')
    }
  },
  output: {
    libraryTarget: 'commonjs',
    libraryExport: 'default',
    filename: '[name].js',
    path: path.resolve(__dirname, '../test-output')
  },
  module: {
    rules: [
      { test: /\.handlebars$/, loader: 'handlebars-loader' },
      {
        test: /src\/.*\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {}
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'ENV_TESTING': true
    })
  ]
};

module.exports = config;
