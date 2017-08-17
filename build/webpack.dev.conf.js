const webpack = require('webpack');
const pathConf = require('./pathConfig');
const path = require('path');
const baseConf = require('./webpack.base.conf');
const merge = require('webpack-merge');
const ExtractTextPlugin = require("extract-text-webpack-plugin");


const devConf = merge(baseConf, {
    devtool: '#inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ExtractTextPlugin("index.css")
    ]
});

module.exports = devConf;
