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
                    'ie >= 8',
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



// less
const lessLoader = {
    test: /\.less$/,
    use: process.env.NODE_ENV === 'production' ? ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: lessUse
    }) : [{
        loader: require.resolve('style-loader')
    }].concat(lessUse)
}

// css
const cssLoader = {
    test: /\.css$/,
    use: process.env.NODE_ENV === 'production' ? ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: [{
            loader: require.resolve('css-loader')
        }]
    }) : [{
        loader: require.resolve('style-loader')
    }, {
        loader: require.resolve('css-loader')
    }]
}


const baseConf = {
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
        loaders: [{
                enforce: "pre",
                test: /\.js$/,
                use: ['eslint-loader'],
                include: path.resolve(__dirname, '../src'),
                exclude: path.resolve(__dirname, '../node_modules')
            },
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
        })
    ]
}

// es3ifyPlugin 会导致开发环境内存泄漏，所以正常开发模式下，不建议引入
if (process.env.NODE_ENV === 'production' || process.env.BROWSER === 'ie8') {
    baseConf.plugins.push(new es3ifyPlugin());
}

module.exports = baseConf;