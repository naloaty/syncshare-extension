const CopyPlugin = require("copy-webpack-plugin");
const commonDevConfig = require("../../webpack/webpack.dev.js");
const { merge } = require("webpack-merge");
const path = require("path");

const firefoxRoot = path.resolve(__dirname, "../");

const firefoxDevConfig = {
    output: {
        path: path.resolve(firefoxRoot, "distr")
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(
                        firefoxRoot,
                        "manifests",
                        "manifest.template.json"
                    ),
                    to: "manifest.json",
                    transform(content) {
                        const manifest = JSON.parse(content.toString());

                        manifest.name = "SyncShare - Development";
                        manifest.version = process.env.npm_package_version;

                        const services = [
                            "<all_urls>"
                        ];

                        manifest.permissions = services;
                        delete manifest.content_security_policy;
                        //manifest.content_security_policy = `default-src 'self'; connect-src 'self' ${services.join(" ")} http:;`;

                        return JSON.stringify(manifest, null, 4);
                    }
                },
                {
                    from: path.resolve(firefoxRoot, "src")
                },
                {
                    from: path.resolve(firefoxRoot, "..", "src")
                }
            ]
        })
    ]
};

module.exports = merge(commonDevConfig, firefoxDevConfig);