const webpack = require('webpack');
const pathConf = require('./pathConfig');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const oldie = require('oldie');
const es3ifyPlugin = require('es3ify-webpack-plugin');
const package = require('../package.json');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

//'es5-shim','es5-shim/es5-sham,'jquery', 'blueimp-file-upload' ,'blueimp-file-upload/js/jquery.iframe-transport.js','mustache'
const vender = ['jquery', 'blueimp-file-upload', 'blueimp-file-upload/js/jquery.iframe-transport.js', 'mustache'];

module.exports = {
    entry: {
        index: [pathConf.indexPath],
        vendor: vender
    },
    resolve: {
        root: pathConf.srcPath,
        alias: {
            'jquery-ui/ui/widget': path.resolve(__dirname, '../node_modules/blueimp-file-upload/js/vendor/jquery.ui.widget.js')
        }
    },
    output: {
        filename: 'index.js',
        path: pathConf.distPath,
        publicPath: '/'
    },
    module: {
        loaders: [{
                test: /\.js$/,
                include: pathConf.srcPath,
                loader: 'babel?cacheDirectory=true',
                exclude: ['node_modules']
            },
            {
                test: /\.less$/,
                include: pathConf.srcPath,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!less-loader')
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            }, {
                test: /\.(png|jpg|gif)$/,
                // exclude: /sprite/,
                loader: 'url-loader?limit=8192&name=imgs/[hash].[ext]' // 小于10K做成base64 url
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\jquery-form/,
                loader: "imports?define=>false"
            },{
                test: /\.json/,
                loader:'file-loader?name=static/[name].[ext]'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: pathConf.publicPath,
        }),
        new webpack.optimize.CommonsChunkPlugin("vendor", "libary.js"),
        new es3ifyPlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),



    ],
    postcss: function () {
        return [
            oldie({
                opacity: {
                    method: 'copy'
                },
                rgba: {
                    method: 'clone',
                    filter: true
                }
            }),
            autoprefixer({
                browsers: ['ie >= 8', '> 0.01%', 'Firefox >= 20']
            })
        ]
    }
}
