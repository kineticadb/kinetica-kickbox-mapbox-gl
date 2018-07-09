const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: 'style.css'
});

const varConfig = {
  context: path.resolve(__dirname, '../src'),
  entry: {
    app: ['babel-polyfill', './js/kickbox.js']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/')
    }
  },
  output: {
    library: 'kickbox',
    libraryExport: 'default',
    filename: 'kickbox.min.js',
    path: path.resolve(__dirname, '../dist'),
    libraryTarget: 'var'
  },
  module: {
    rules: [
      { test: /\.html$/, use: ['html-loader'] },
      { test: /\.handlebars$/, loader: 'handlebars-loader' },
      { test: /\.scss$/, loader: 'style!css!sass' },
      { test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  },
  plugins: [
    extractSass,
    new webpack.optimize.UglifyJsPlugin()
  ]
};

// #endregion Module Export

//////////////////////////////
// Module Exports
//////////////////////////////

module.exports = [varConfig];

// #endregion Module Exports
