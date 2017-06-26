const devConfig = require('./webpack.dev.conf');
const merge = require('webpack-merge');
const pathConf = require('./pathConfig');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const proConf = merge(devConfig,{
    devtool:false,
    plugins:[
        new CleanWebpackPlugin(path.resolve(__dirname,pathConf.distPath),{
            root: path.resolve(__dirname,'../')
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
});

module.exports=proConf;