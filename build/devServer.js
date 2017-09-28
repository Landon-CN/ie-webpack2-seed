const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const webapckDevConfig = require('./webpack.dev.conf');
const webapckProConfig = require('./webpack.pro.conf');
const fetch = require('node-fetch');

webapckDevConfig.entry.index.unshift("webpack-dev-server/client?http://localhost:8080/");
var compiler = webpack(process.env.NODE_ENV === 'pre' ? webapckProConfig : webapckDevConfig);

let targetUrl = '10.9.10.4';
let messageUrl = '10.9.10.4';
let bmsUrl = '10.9.10.37';
let webImPort = '8088';
let messagePort = '8090';
let bmsPort = '8080';

let local = true;
if (local) {
    targetUrl = '10.9.10.31';
    messageUrl = '10.9.10.31';
    bmsUrl = '10.9.10.31';
    bmsPort = '8160';
    messagePort = '8090';
    webImPort = '8088';
}


// 开发环境
// http://wiki.cbpmgt.com/confluence/pages/viewpage.action?pageId=20595574
let dev = false;
if (dev) {
    targetUrl = '172.25.47.40';
    messageUrl = '172.25.47.40';
    bmsUrl = '172.25.47.40';
    bmsPort = '8160';
    messagePort = '8090';
    webImPort = '8088';
}

let test = true;
if (test) {
    targetUrl = 'jtalk.jd.com';
    messageUrl = 'jtalk.jd.com';
    bmsUrl = 'jtalk.jd.com';
    bmsPort = '80';
    webImPort = '80';
    messagePort = '80'
}

var server = new webpackDevServer(compiler, {
    // webpack-dev-server options
    // hot: true,
    contentBase: webapckDevConfig.output.path,
    // Can also be an array, or: contentBase: "http://localhost/",


    historyApiFallback: false,
    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.

    compress: false,
    // Set this if you want to enable gzip compression for assets

    proxy: {
        '/jtbms/**': {
            target: `http://${bmsUrl}:${bmsPort}`,
            changeOrigin: true,
        },
        '/jtalk/message/**': {
            target: `http://${messageUrl}:${messagePort}`,
            changeOrigin: true,
        },
        '/jtalk/**': {
            target: `http://${targetUrl}:${webImPort}`,
            changeOrigin: true,
        }
    },
    // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
    // Use "**" to proxy all paths to the specified server.
    // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
    // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
    disableHostCheck: true,
    setup: function (app) {

        app.all('/', function (req, res, next) {

            fetch(`http://${messageUrl}:${messagePort}/index.htm`, {
                redirect: 'manual',
                headers: Object.assign(req.headers, {
                    host: 'jtalk.jd.com'
                }),
                timeout: 1000
            }).then((response) => {
                let statusCode = response.status;
                // console.log(statusCode);


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
server.listen(8080, '0.0.0.0');
