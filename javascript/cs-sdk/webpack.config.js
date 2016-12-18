var webpack = require('webpack');
var devFlag = (process.env.DEV || "false").toLowerCase().trim() === "true";

var webpackConfig = {
    entry: "./src/index",
    plugins: [],
    output: {
        filename: devFlag ? "cssdk.js" : "cssdk.min.js",
        path: "./dist/",
        publicPath: "/dist/",
        library: "cssdk",
        libraryTarget: "umd"
    },
    devtool: "inline-source-map"
};

if (!devFlag) {
    console.log("DEV=false");
    webpackConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: false,
            screwIe8: true,
            compress: {
                warnings: false
            }
        })
    );
} else {
    console.log("DEV=true");
}

module.exports = webpackConfig;
