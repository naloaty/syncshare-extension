const CopyPlugin = require("copy-webpack-plugin");
const commonProdConfig = require("../../webpack/webpack.prod.js");
const { merge } = require("webpack-merge");
const path = require("path");

const chromeRoot = path.resolve(__dirname, "../");

const chromeProdConfig = {
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

                        manifest.version = process.env.NPM_PACKAGE_VERSION;
                        manifest.update_url = "https://clients2.google.com/service/update2/crx";

                        const services = [
                            process.env.SERVICE_URL,
                            process.env.ANALYTICS_URL
                        ];

                        manifest.content_security_policy = `default-src 'self'; connect-src 'self' ${services.join(" ")} https:;`;

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

module.exports = merge(commonProdConfig, chromeProdConfig);