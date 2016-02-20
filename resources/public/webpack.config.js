var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './es6/main.js',
  output: {
    path: __dirname,
    filename: 'build/bundle.js'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        test: path.join(__dirname, 'es6'),
        query: {
          presets: ["es2015", "react"],

        },
      }
    ]
  },
  plugins: [
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin()
  ],
  stats: {
    // Nice colored output
    colors: true
  },
  // Create Sourcemaps for the bundle
  devtool: 'source-map',
  devServer: {
    proxy: {
      '/micromonitor/*': {
        target: 'http://localhost:1337/',
        secure: false
      }
    }
  }
};
