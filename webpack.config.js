const path = require('path');

module.exports = {
  entry: './js/carousel.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
            }
        }
    ],
  },
  mode: 'production', // Or 'development' if you want a development build
};
