var webpack = require('webpack');

module.exports = {
    entry: {
        "main": "./chrome/ChatLeecher.ts"//electron default entry index.js if no package.json
    },
    output: {
        path: './chrome',
        filename: "[name].js"
    },
    devtool: 'source-map',
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ],
        loaders: [
            {test: /\.json$/,loader: 'json'},
            {test: /\.tsx?$/, loader: "ts-loader"},
            {test: /\.html$/, loader: "html-loader?minimize=false"}
        ]
    },
    resolve: {
        extensions: ["", ".ts", ".tsx", ".html", ".js"]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
