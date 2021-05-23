const CopyPlugin = require("copy-webpack-plugin");
const commonDevConfig = require("../../webpack/webpack.dev.js");
const { merge } = require("webpack-merge");
const path = require("path");

const chromeRoot = path.resolve(__dirname, "../");

const chromeDevConfig = {
    output: {
        path: path.resolve(chromeRoot, "distr")
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(
                        chromeRoot,
                        "manifests",
                        "manifest.template.json"
                    ),
                    to: "manifest.json",
                    transform(content) {
                        const manifest = JSON.parse(content.toString());

                        manifest.name = "SyncShare - Development";
                        manifest.version = process.env.npm_package_version;

                        const services = [
                            process.env.SERVICE_URL
                        ];

                        manifest.content_security_policy = `default-src 'self'; connect-src 'self' ${services.join(" ")} http:;`;

                        return JSON.stringify(manifest, null, 4);
                    }
                },
                {
                    from: path.resolve(chromeRoot, "src")
                },
                {
                    from: path.resolve(chromeRoot, "..", "src")
                }
            ]
        })
    ]
};

module.exports = merge(commonDevConfig, chromeDevConfig);