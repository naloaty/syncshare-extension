/* eslint-env node */

const path                   = require("path");
const webpack                = require("webpack");
const dotenv                 = require("dotenv");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const rootDir = path.resolve(__dirname, "../../");

dotenv.config({
    path: path.resolve(rootDir, "browsers", process.env.ENV_FILE ?? ".env")
});

const nodeConfig = { global: true };

const config = {
    context: rootDir,
    node:    nodeConfig,
    target:  "web",
    output: {
        globalObject:  "window",
        filename:      "[name].js",
        chunkFilename: "bundles/[name].bundle.js",
        publicPath:    "/"
    },
    entry: {
        "quiz-page": path.resolve(rootDir, "src", "pages", "quiz.js"),
        "services":  path.resolve(rootDir, "src", "pages", "services.js"),
    },
    resolve: {
        mainFields:  ["browser", "module", "main"],
        aliasFields: ["browser"],
        alias: {
            Internal:     path.resolve(rootDir, "src/internal"),
            Utils:        path.resolve(rootDir, "src/utils"),
            Parsers:      path.resolve(rootDir, "src/parsers"),
            Pages:        path.resolve(rootDir, "src/pages"),
            Widgets:      path.resolve(rootDir, "src/widgets"),
            Service:      path.resolve(rootDir, "src/service"),
            node_modules: path.resolve(rootDir, "node_modules")
        },
        extensions: [".js"]
    },
    optimization: {
        splitChunks: { 
            automaticNameDelimiter: '-' 
        },
    },
    plugins: [
        new webpack.DefinePlugin(
            {
                SERVICE_URL:   JSON.stringify(process.env.SERVICE_URL),
                ANALYTICS_URL: JSON.stringify(process.env.ANALYTICS_URL),
                ANALYTICS_ID:  JSON.stringify(process.env.ANALYTICS_ID),
                VERSION:       JSON.stringify(process.env.npm_package_version)
            }
        ),
        new CleanWebpackPlugin()
    ]
}

module.exports = config;