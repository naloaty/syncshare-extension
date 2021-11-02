/* eslint-env node */

const commonConfig = require("./webpack.base.js");
const webpack      = require("webpack");
const { merge }    = require("webpack-merge");

const config = {
    mode:    "development",
    devtool: "inline-source-map",
    plugins: [
        new webpack.EnvironmentPlugin(
            {
                NODE_ENV: "development",
                DEBUG: true
            }
        ),
        new webpack.DefinePlugin(
            {
                SERVICE_URL: JSON.stringify(process.env.SERVICE_URL ?? "http://localhost:5000")
            }
        )
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

    return merge(commonConfig, config);
})();