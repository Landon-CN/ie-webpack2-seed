const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const webapckDevConfig = require('./webpack.dev.conf');
const webapckProConfig = require('./webpack.pro.conf');
const fetch = require('node-fetch');

webapckDevConfig.entry.index.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
webapckDevConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
var compiler = webpack(process.env.NODE_ENV === 'pre' ? webapckProConfig : webapckDevConfig);

let targetUrl = '172.25.47.40'; // server
let messageUrl = '172.25.47.37'; // server

let local = true;
if (local) {
    targetUrl = '10.9.46.154';
    messageUrl = '10.9.46.154';
}

var server = new webpackDevServer(compiler, {
    // webpack-dev-server options
    hot: true,
    contentBase: webapckDevConfig.output.path,
    // Can also be an array, or: contentBase: "http://localhost/",


    historyApiFallback: false,
    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.

    compress: false,
    // Set this if you want to enable gzip compression for assets

    proxy: {
        '/jtalk/message/**': `http://${messageUrl}:8090`,
        '/jtalk/**': `http://${targetUrl}:8088`
    },
    // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
    // Use "**" to proxy all paths to the specified server.
    // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
    // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
    disableHostCheck: true,
    setup: function (app) {

        app.all('/', function (req, res, next) {

            fetch(`http://${messageUrl}:8090/index.htm`, {
                redirect: 'manual',
                headers: req.headers,
                timeout: 1000
            }).then((response) => {
                let statusCode = response.status;
                console.log(statusCode);


                if (statusCode == 302 || statusCode == 304) {
                    let url = encodeURIComponent(`http://${req.get('host')}/`);
                    let returnUrl = `http://passport.jd.com/new/login.aspx?ReturnUrl=${url}`;
                    return res.redirect(302, returnUrl)
                }
                return next();

            }).catch(() => {
                next();
            });

        });
    },

    inline: true,
    clientLogLevel: "warn",
    // Control the console log messages shown in the browser when using inline mode. Can be `error`, `warning`, `info` or `none`.

    // webpack-dev-middleware options
    quiet: false,
    noInfo: false,
    lazy: false,
    filename: webapckDevConfig.output.filename,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },
    // It's a required option.
    publicPath: "/",
    stats: {
        colors: true
    },
});
server.listen(8080);
