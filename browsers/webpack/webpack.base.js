const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const WebExtensionTarget = require("webpack-target-webextension");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const rootDir = path.resolve(__dirname, "../../");

dotenv.config({
    path: path.resolve(rootDir, "browsers", process.env.ENV_FILE ?? ".env")
});

const nodeConfig = {
    global: true
};

const commonConfig = {
    context: rootDir,
    node: nodeConfig,
    target: "web",
    output: {
        globalObject: "window",
        filename: "[name].js",
        chunkFilename: "bundles/[name].bundle.js",
        publicPath: "/"
    },
    entry: {
        quizContentScript: path.resolve(rootDir, "src", "content", "attempt-processor.js"),
        quizBackgroundHandler: path.resolve(rootDir, "src", "background", "quiz-handler.js"),
        background: path.resolve(rootDir, "src", "background", "background.js")
    },
    resolve: {
        // Need to set these fields manually as their default values rely on `web` target.
        // See https://v4.webpack.js.org/configuration/resolve/#resolvemainfields
        mainFields: ["browser", "module", "main"],
        aliasFields: ["browser"],
        alias: {
            "@": path.resolve(rootDir, "src"),
            node_modules: path.resolve(rootDir, "node_modules")
        },
        extensions: [".js"]
    },
    optimization: {
        // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1108199
        splitChunks: { automaticNameDelimiter: '-' },
    },
    plugins: [
        new webpack.DefinePlugin({
            SERVICE_URL: JSON.stringify(process.env.SERVICE_URL),
            ANALYTICS_URL: JSON.stringify(process.env.ANALYTICS_URL),
            ANALYTICS_ID: JSON.stringify(process.env.ANALYTICS_ID),
            VERSION: JSON.stringify(process.env.npm_package_version)
        }),
        new WebExtensionTarget(),
        new CleanWebpackPlugin()
    ]
}

module.exports = commonConfig;