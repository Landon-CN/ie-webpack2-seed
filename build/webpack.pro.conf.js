const devConfig = require('./webpack.dev.conf');
const merge = require('webpack-merge');
const pathConf = require('./pathConfig');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const proConf = merge(devConfig, {
    output:{
        publicPath: '/dist/'
    },
    devtool: false,
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warn: false,
                screw_ie8: false
            },
            mangle: {
                screw_ie8: false
            },
            output: {
                screw_ie8: false
            },
            exclude: /\.less$/i
        })
    ]
});

if (process.env.NODE_ENV != 'pre') {
    proConf.plugins.push(new CleanWebpackPlugin(path.resolve(__dirname, pathConf.distPath), {
        root: path.resolve(__dirname, '../')
    }))
}

module.exports = proConf;