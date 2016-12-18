var webpack = require('webpack');

var webpackConfig = {
    entry: "./spec/all-specs",
    output: {
        filename: "cssdk-spec.js",
        path: "./dist/",
        publicPath: "/dist/"
    },
    devtool: "inline-source-map"
};

module.exports = webpackConfig;
