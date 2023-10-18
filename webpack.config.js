const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/booking.js",
  output: {
    filename: "bundle.js",
  },
  mode: "development",
  module: {
    rules: [
      { test: /\.js?$/, loader: "babel-loader", exclude: /node_modules/ },
    ],
  },
  devServer: {
    contentBase: "src",
    hot: true,
    open: true,
    port: 8000,
    watchContentBase: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new Dotenv(),
  ],
};
