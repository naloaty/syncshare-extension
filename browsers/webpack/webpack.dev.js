const commonConfig = require("./webpack.base.js");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const developmentConfig = {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: "development",
            DEBUG: true
        }),
        new webpack.DefinePlugin({
            SERVICE_URL: JSON.stringify(process.env.SERVICE_URL ?? "http://localhost:5000"),
            ANALYTICS_URL: JSON.stringify(process.env.ANALYTICS_URL ?? "http://undefined:0000"),
            ANALYTICS_ID: JSON.stringify(process.env.ANALYTICS_ID ?? "un-de-fi-ne-d")
        })
    ],
    optimization: {
        minimize: false
    }
};

module.exports = (() => {
    console.log("VERSION: ", process.env.NPM_PACKAGE_VERSION);
    console.log("SERVICE_URL: ", process.env.SERVICE_URL);
    console.log("ANALYTICS_URL: ", process.env.ANALYTICS_URL);
    console.log("ANALYTICS_ID: ", process.env.ANALYTICS_ID);

    return merge(commonConfig, developmentConfig);
})();