const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
// const merge = require('webpack-merge');

const libraryTarget = [{
    type: "var",
    name: 'lib.js'
}, {
    type: "commonjs2",
    name: 'lib.commonjs2.js'
}];

function getConfig(target) {
    const baseConfig = {
        entry: './src/index.ts',
        devtool: 'source-map',
        mode: "development",
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.css?$/,
                use: 'css-loader',
                exclude: /node_modules/
            }]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.css']
        },
        output: {
            path: path.resolve(__dirname, 'dist/'),
            filename: target.name,
            library: 'JsStore',
            libraryTarget: target.type
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: 'src/middleware.js', to: '' },
                ],
            }),
        ]
    };

    return baseConfig;
}

var configs = [];
libraryTarget.forEach(function (target) {
    configs.push(getConfig(target));
})
module.exports = configs;