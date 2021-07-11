const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
// const merge = require('webpack-merge');
const isDev = process.env.NODE_ENV === "development";
const libraryTarget = [{
    type: "var",
    name: isDev ? 'middleware.js' : 'middleware.min.js'
},
{
    type: "commonjs2",
    name: isDev ? 'middleware.commonjs2.js' : 'middleware.commonjs2.min.js'
}
];

function getConfig(target) {
    const baseConfig = {
        entry: './src/middleware.ts',
        devtool: 'source-map',
        mode: process.env.NODE_ENV,
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
        externals: {
            jsstore: 'jsstore',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            path: path.resolve(__dirname, 'dist/'),
            filename: target.name,
            libraryTarget: target.type,
            library: 'Ujjwal',

        },
        plugins: [
            // new CopyPlugin({
            //     patterns: [
            //         { from: 'src/middleware.js', to: '' },
            //     ],
            // }),
        ]
    };

    return baseConfig;
}

var configs = [];
libraryTarget.forEach(function (target) {
    configs.push(getConfig(target));
})
module.exports = configs;