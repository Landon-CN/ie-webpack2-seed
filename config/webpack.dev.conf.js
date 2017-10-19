const webpack = require('webpack');
const baseConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const paths = require('./paths');



const devConfig = merge(baseConfig, {
    devtool: "#inline-source-map",
    plugins: [
        new FriendlyErrorsWebpackPlugin(),
        new HtmlWebpackPlugin({
            favicon: paths.faviconPath,
            filename: 'index.html',
            template: paths.indexHtml,
            inject: true
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),

    ]
});

// ie8 不支持hot reload
if (process.env.BROWSER !== 'ie8') {
    devConfig.entry = [
        path.resolve(__dirname, './devClient.js')
    ].concat(baseConfig.entry);
    devConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = devConfig;