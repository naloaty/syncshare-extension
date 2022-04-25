/* eslint-env node */

const { readFileSync } = require("fs");
const webpack = require("webpack");
const { join } = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WebExtensionPlugin = require("webpack-target-webextension");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const GenerateJsonFromJsPlugin = require("generate-json-from-js-webpack-plugin");
const PACKAGE = require("./package.json");

const ROOT_PATH = __dirname;

module.exports = (env, argv) => {
    const isDevelopment = argv?.mode === "development";
    const isChrome = Boolean(env?.chrome);

    const connectUrls = isDevelopment ? [
        "http://localhost:5000"
    ] : [
        "NOTHING YET"
    ];

    return {
        context: ROOT_PATH,
        mode: isDevelopment ? "development" : "production",
        entry: {
            /** Background */
            background: join(ROOT_PATH, "src/background/main.js"),

            /** Content */
            quizattempt: join(ROOT_PATH, "src/content/quiz/main.js"),
            quizoverview: join(ROOT_PATH, "src/content/quiz/overview.js"),
            quizboard: join(ROOT_PATH, "src/content/quiz/board.js")
        },
        stats: {
            errorDetails: true
        },
        output: {
            filename: "src/[name].js",
            path: join(ROOT_PATH, "dist")
        },
        resolve: {
            extensions: [".js"],
            modules: [join(ROOT_PATH, "src"), "node_modules"]
            // alias: {} 
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: join(ROOT_PATH, "src/icons"), to: "icons" },
                    { from: join(ROOT_PATH, "src/styles"), to: "styles" },
                    { from: join(ROOT_PATH, "src/_locales"), to: "_locales" }
                ]
            }),
            new webpack.DefinePlugin({
                SERVICE_URL: JSON.stringify(env?.SERVICE_URL),
                VERSION:     JSON.stringify(PACKAGE.version)
            }),
            new HtmlWebpackPlugin({
                filename: "src/background.html",
                templateContent: readFileSync(join(ROOT_PATH, "src/background/main.template.html"), "utf8"),
                chunks: ["background"],
            }),
            new GenerateJsonFromJsPlugin({
                path: join(ROOT_PATH, "src/manifest.cjs"),
                filename: "manifest.json",
                data: { isChrome, isDevelopment, connectUrls, PACKAGE },
            }),
            new WebExtensionPlugin({
                background: { entry: "background", manifest: 2 }
            }),
            new CleanWebpackPlugin()
        ],
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        name: "commons",
                        chunks: "initial",
                        minChunks: 2,
                        enforce: true
                    }
                }
            }
        },
        devtool: isDevelopment ? "inline-source-map" : undefined
    }

}