const CopyPlugin = require("copy-webpack-plugin");
const commonProdConfig = require("../../webpack/webpack.prod.js");
const { merge } = require("webpack-merge");
const path = require("path");

const firefoxRoot = path.resolve(__dirname, "../");

const firefoxProdConfig = {
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
                        
                        manifest.version = process.env.npm_package_version;

                        const services = [
                            process.env.SERVICE_URL + "/*",
                            process.env.ANALYTICS_URL + "/*"
                        ];

                        manifest.permissions = services;
                        manifest.content_security_policy = `default-src 'self'; connect-src 'self' ${services.join(" ")} https:;`;

                        manifest.browser_specific_settings = {
                            gecko: {
                                id: "syncshare@naloaty.com",
                                update_url: "https://naloaty.github.io/syncshare/updates.json"
                            }
                        }

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

module.exports = merge(commonProdConfig, firefoxProdConfig);