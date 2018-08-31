const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSass = new ExtractTextPlugin({
  filename: 'style.css',
  disable: process.env.NODE_ENV === 'development'
});

const config = {
  context: path.resolve(__dirname, '../src'),
  entry: {
    app: './js/kickbox.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/')
    }
  },
  output: {
    library: 'kickbox',
    libraryExport: 'default',
    libraryTarget: 'umd',
    filename: 'kickbox.umd.min.js',
    path: path.resolve(__dirname, '../dev-dist'),
    publicPath: path.resolve(__dirname, '../dev-dist')
  },
  module: {
    rules: [
      { test: /\.html$/, use: ['html-loader'] },
      { test: /\.handlebars$/, loader: 'handlebars-loader' },
      { test: /\.scss$/, loader: 'style!css!sass?sourceMap' }
    ]
  },
  plugins: [
    extractSass
  ],
  devtool: 'inline-source-map'
};

module.exports = config;
