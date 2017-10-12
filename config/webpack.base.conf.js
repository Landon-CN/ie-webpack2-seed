const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path');
const paths = require('./paths');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const es3ifyPlugin = require('es3ify-webpack-plugin');


const lessUse = [{
    loader: require.resolve('css-loader'),
    options: {
        importLoaders: 1,
        minimize: process.env.NODE_ENV === 'production'
    },
}, {
    loader: require.resolve('postcss-loader'),
    options: {
        ident: 'postcss',
        plugins: () => [
            require('postcss-flexbugs-fixes'),
            autoprefixer({
                browsers: [
                    'last 2 versions',
                    'Chrome >= 20',
                    'Firefox >= 20',
                    'ie >= 8', // React doesn't support IE8 anyway
                ],
                flexbox: 'no-2009',
            }),
            require('oldie')({
                opacity: {
                    method: 'copy'
                }
            })
        ],
    },
}, {
    loader: require.resolve('less-loader')
}];




const lessLoader = {
    test: /\.less$/,
    use: process.env.NODE_ENV === 'production' ? ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: lessUse
    }) : [{
        loader: require.resolve('style-loader')
    }].concat(lessUse)
}


module.exports = {
    entry: [paths.srcPath],
    output: {
        filename: 'static/[name].js',
        path: paths.outputPath,
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.js']
    },
    module: {
        loaders: [
            // {
            //     enforce: "pre",
            //     test: /\.(ts|tsx)$/,
            //     use: ['tslint-loader'],
            //     include: path.resolve(__dirname, '../src'),
            //     exclude: path.resolve(__dirname, '../node_modules')
            // },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                include: path.resolve(__dirname, '../src'),
                exclude: path.resolve(__dirname, '../node_modules')
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve('url-loader'),
                options: {
                    limit: 10000,
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
            lessLoader,
            {
                exclude: [
                    /\.html$/,
                    /\.(js|jsx)(\?.*)?$/,
                    /\.(ts|tsx)(\?.*)?$/,
                    /\.css$/,
                    /\.less$/,
                    /\.json$/,
                    /\.bmp$/,
                    /\.gif$/,
                    /\.jpe?g$/,
                    /\.png$/,
                ],
                loader: require.resolve('file-loader'),
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new es3ifyPlugin(),
    ]
}