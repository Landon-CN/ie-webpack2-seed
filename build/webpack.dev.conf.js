const webpack = require('webpack');
const pathConf = require('./pathConfig');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const oldie = require('oldie');
const es3ifyPlugin = require('es3ify-webpack-plugin');
const package = require('../package.json');


let dependencies = Object.keys(package.dependencies);

const vender = [].concat(dependencies,['es5-shim/es5-sham','blueimp-file-upload/js/jquery.iframe-transport.js'])
console.log(vender);

module.exports = {
    devtool: '#inline-source-map',
    entry: {
        index: [pathConf.indexPath],
        vendor: vender
    },
    resolve:{
        root:[pathConf.srcPath],
        alias:{'jquery-ui/ui/widget': path.resolve(__dirname,'../node_modules/blueimp-file-upload/js/vendor/jquery.ui.widget.js')}
    },
    output: {
        filename: 'index.[hash].js',
        path: pathConf.distPath,
        chunkFilename: '[name].[chunkhash].js',
        publicPath: '/'
    },
    module: {
        loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: 'style-loader!css-loader!sprite-loader!postcss-loader!less-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg)$/,
                exclude: /sprite/,
                loader: 'url-loader?limit=8192&name=imgs/[hash].[ext]' // 小于10K做成base64 url
            },
            {
                test: /\.gif$/,
                loader: "file-loader?name=imgs/[name].[ext]"
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: pathConf.publicPath,
        }),
        new webpack.optimize.CommonsChunkPlugin("vendor", "libary.[hash].js"),
        new es3ifyPlugin(),
        new webpack.ProvidePlugin({ "window.jQuery": "jquery" })
    ],
    postcss: function () {
        return [
            // sprites(spriteOpts),
            autoprefixer({
                browsers: ['ie >= 8', '> 0.01%', 'Firefox >= 20']
            })
        ]
    }
}