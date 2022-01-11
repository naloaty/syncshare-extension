const path = require("path");
const commonConfig = require("./webpack.base.js");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const CopyPlugin = require("copy-webpack-plugin");

const rootDir = path.resolve(__dirname, "../../");

const productionConfig = {
    mode: "production",
    devtool: "nosources-source-map",
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: "production",
            DEBUG: false
        }),
        new webpack.DefinePlugin({
            DISABLE_ANALYTICS: false
        }),
        new CopyPlugin({
            patterns: [
                { from: path.resolve(rootDir, "LICENSE.md") },
            ]
        })
    ],
    optimization: {
        minimize: false,
        usedExports: true
    }
};

module.exports = (() => {
    console.log("VERSION: ", process.env.npm_package_version);
    console.log("SERVICE_URL: ", process.env.SERVICE_URL);
    console.log("ANALYTICS_URL: ", process.env.ANALYTICS_URL);
    console.log("ANALYTICS_ID: ", process.env.ANALYTICS_ID);

    return merge(commonConfig, productionConfig);
})();