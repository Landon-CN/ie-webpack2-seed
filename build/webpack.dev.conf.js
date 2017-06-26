const webpack = require('webpack');
const path = require('./pathConfig');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const oldie = require('oldie');
const sprites = require('postcss-sprites');
const es3ifyPlugin = require('es3ify-webpack-plugin');

// post-sprite 配置项
const spriteOpts = {
    stylesheetPath: path.distPath,
    spritePath: path.imgPath,
    groupBy: function (img) {

        if (img.url.indexOf('.gif') > -1) {
            return Promise.resolve('emoji');
        }
        return Promise.reject('default');

    }
};

module.exports = {
    devtool: '#inline-source-map',
    entry: {
        index: [path.indexPath],
        vendor: ['jquery', 'es5-shim', 'es5-shim/es5-sham']
    },
    resolve:{
        root:[path.srcPath]
    },
    output: {
        filename: 'index.[hash].js',
        path: path.distPath,
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
            template: path.publicPath,
        }),
        new webpack.optimize.CommonsChunkPlugin("vendor", "libary.[hash].js"),
        new es3ifyPlugin()
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