const devConfig = require('./webpack.dev.conf');
const merge = require('webpack-merge');
const pathConf = require('./pathConfig');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const proConf = merge(devConfig, {
    devtool: '#hidden-source-map',
    output: {
        filename: 'index.[chunkhash].js',
        publicPath: '/dist/'
    },
    devtool: false,
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: false
            },
            mangle: {
                screw_ie8: false
            },
            output: {
                screw_ie8: false
            },
            exclude: /\.less$/i
        }),
        new webpack.optimize.CommonsChunkPlugin("vendor", "libary.[chunkhash].js"),
        new ExtractTextPlugin("index.[chunkhash].css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
    ]
});



if (process.env.NODE_ENV != 'pre') {
    proConf.plugins.push(new CleanWebpackPlugin(path.resolve(__dirname, pathConf.distPath), {
        root: path.resolve(__dirname, '../')
    }))
}

module.exports = proConf;
