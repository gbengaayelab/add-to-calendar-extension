const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js', // Entry for background.js
  },
  output: {
    filename: '[name].js',             // Output filenames: background.js
    path: path.resolve(__dirname, 'dist'),
    clean: true,                       // Clean the dist folder before every build
  },
  mode: 'production',                  // Optimize for production
  resolve: {
    extensions: ['.js'],               // Resolve .js files automatically
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),              // Minify JavaScript
      new CssMinimizerPlugin(),        // Minify CSS
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/welcome.html',  // Copy and process welcome.html
      filename: 'welcome.html',        // Output in dist/
      inject: false,                   // No JS injection
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/icons', to: 'icons' },             // Copy entire icons directory
        { from: './src/manifest.json', to: 'manifest.json' }, // Copy manifest.json
        { from: './src/js/player.js', to: 'js/player.js' },   // Copy player.js to dist/js/
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,               // Handle CSS files
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/i,              // Handle HTML files
        loader: 'html-loader',
      },
      {
        test: /\.js$/,                 // Handle JS files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
