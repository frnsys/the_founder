var path = require('path');

var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js'),
  pixi = path.join(phaserModule, 'build/custom/pixi.js'),
  p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  entry: './main',
  output: {
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.sass$/,
        loaders: [
          'style',
          'css',
          'autoprefixer?browsers=last 3 versions',
          'sass?outputStyle=expanded'
        ]
      },
      {
        test: /\.json$/,
        loaders: ['json']
      },
      { test: /pixi\.js/, loader: 'expose?PIXI' },
      { test: /phaser-split\.js$/, loader: 'expose?Phaser' },
      { test: /p2\.js/, loader: 'expose?p2' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.sass'],
    modulesDirectories: ['node_modules'],
    alias: {
      'phaser': phaser,
      'pixi': pixi,
      'p2': p2,
      'app': path.resolve('./app'),
      'data': path.resolve('./data'),
      'debug': path.resolve('./app/debug'),
      'util': path.resolve('./app/util.js'),
      'game': path.resolve('./app/game'),
      'views': path.resolve('./app/views'),
      'office': path.resolve('./app/office'),
      'states': path.resolve('./app/states'),
      'market': path.resolve('./app/market')
    }
  }
};
