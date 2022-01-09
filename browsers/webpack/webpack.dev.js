const commonConfig = require("./webpack.base.js");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const developmentConfig = {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new webpack.EnvironmentPlugin({
            DEBUG: true
        }),
        new webpack.DefinePlugin({
            DISABLE_ANALYTICS: true
        }),
    ],
    optimization: {
        minimize: false
    }
};

module.exports = (() => {
    console.log("VERSION: ", process.env.npm_package_version);
    console.log("SERVICE_URL: ", process.env.SERVICE_URL);
    console.log("ANALYTICS_URL: ", process.env.ANALYTICS_URL);
    console.log("ANALYTICS_ID: ", process.env.ANALYTICS_ID);

    return merge(commonConfig, developmentConfig);
})();