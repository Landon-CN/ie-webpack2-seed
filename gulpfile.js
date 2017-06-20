const gulp = require('gulp');
const babel = require('gulp-babel');
const iife = require('gulp-iife');
const concat = require('gulp-concat');
const clean = require('gulp-rm');
const inject = require('gulp-inject');
const less = require('gulp-less');
const lessAutoprefix = require('less-plugin-autoprefix');
const postcss = require('gulp-postcss');
const oldIe = require('oldie');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const browsersSync = require('browser-sync');
const plumber = require('gulp-plumber');
const sprites = require('postcss-sprites');
const path = require('path');
const uglyJs = require('gulp-uglify');
const rename = require('gulp-rename');
const inline = require('gulp-inline-template');
const proxy = require('http-proxy-middleware');
const cssmin = require('gulp-cssmin');
const rev = require('gulp-rev');
const fs = require('fs');

// const spritesmith = require('gulp.spritesmith');

const reload = browsersSync.reload;
const autoprefix = new lessAutoprefix({
    browsers: ['ie >= 7', 'Chrome > 20', 'Firefox >= 20']
});

const development = process.env.NODE_ENV === 'development';
const production = process.env.NODE_ENV === 'production';
const test = process.env.NODE_ENV === 'test';

const devPath = path.resolve(__dirname, './dev');
const testPath = path.resolve(__dirname, './test');
const proPath = path.resolve(__dirname, './dist');
const serverPort = process.env.PORT ? process.env.PORT : 3001; //访问端口

let buildPath = devPath;
if (production) {
    buildPath = proPath
} else if (test) {
    buildPath = testPath;
}


gulp.task('js', function () {
    let task = gulp.src('./src/**/*.js')
        .pipe(plumber())
        .pipe(gulpIf(development || test, sourcemaps.init()))
        .pipe(gulpIf(production, rev()))
        .pipe(inline())
        .pipe(babel())
        .pipe(iife({
            // 关闭严格模式,可以考虑开发环境下打开
            useStrict: true
        }))
        .pipe(concat('index.js'))
        .pipe(gulpIf(production || test, uglyJs({
            mangle: {
                reserved: ['jQuery']
            }
        })))
        .pipe(gulpIf(production, rename({
            suffix: Math.random() + '.min'
        })))
        .pipe(gulpIf(test, rename({
            suffix: '.min'
        })))
        .pipe(gulpIf(development || test, sourcemaps.write('./')))
        .pipe(gulp.dest(buildPath))
        .pipe(reload({
            stream: true
        }))
});

gulp.task('lib', function () {
    return gulp.src(['./lib/es5-shim.js', './lib/es5-sham.js', './lib/jquery.js', './lib/jquery.ui.widget.js', './lib/*.js'])
        .pipe(concat('lib.js'))
        .pipe(gulpIf(production || test, uglyJs({
            mangle: {
                reserved: ['jQuery']
            }
        })))
        .pipe(gulpIf(production, rename({
            suffix: Math.random() + '.min'
        })))
        .pipe(gulpIf(test, rename({
            suffix: '.min'
        })))
        .pipe(gulp.dest(buildPath));
});

let ignorePath = buildPath.substr(buildPath.lastIndexOf('/'));

gulp.task('html', function () {
    let sources = gulp.src([`${buildPath}/lib*.js`, `${buildPath}/template*.js`, `${buildPath}/*.js`, `${buildPath}/*.css`], {
        read: false
    });
    let target = gulp.src('./src/index.html');
    return target.pipe(inject(sources, {
            ignorePath: ignorePath
        }))
        .pipe(gulp.dest(buildPath))
        .pipe(reload({
            stream: true
        }))
});

gulp.task('clean', function () {
    return gulp.src(['./dist/**/*', './dev/**/*', './test/**'], {
            read: false
        })
        .pipe(clean());
});

// post-sprite 配置项
const spriteOpts = {
    stylesheetPath: buildPath,
    spritePath: path.resolve(buildPath, './imgs'),
    groupBy: function (img) {

        if (img.url.indexOf('.not') > -1) {
            return Promise.reject(new Error('not'))
        }

        if (img.url.indexOf('.gif') > -1) {
            return Promise.resolve('emoji');
        }

        return Promise.resolve('default');

    }
};
gulp.task('less', function () {
    return gulp.src('./src/**/*.less')
        .pipe(gulpIf(development || test, sourcemaps.init()))
        .pipe(less({
            plugins: [autoprefix]
        }).on('error', function (err) {
            console.error(err.message);
            this.emit('end');
        }))
        .pipe(postcss([
            oldIe({
                opacity: {
                    method: 'copy'
                }
            }),
            sprites(spriteOpts)
        ]))
        .pipe(concat('index.css'))
        .pipe(gulpIf(development || test, sourcemaps.write('.')))
        .pipe(gulpIf(production || test, cssmin()))
        .pipe(gulpIf(production, rename({
            suffix: Math.random() + '.min'
        })))
        .pipe(gulpIf(test, rename({
            suffix: '.min'
        })))
        .pipe(gulp.dest(buildPath))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('img', function () {
    gulp.src(['./src/**/*.gif', './src/**/*.png', './src/**/*.jpeg', './src/**/*.jpg'])
        .pipe(rename(function (file) {
            file.dirname = 'imgs';
        }))
        .pipe(gulp.dest(buildPath));
});
let targetUrl = '10.9.46.136';
gulp.task('build', ['img', 'js', 'lib', 'less'], function () {
    gulp.run('html');
});

let proxyMiddleware = proxy('/jtalk/**', {
    target: `http://${targetUrl}:8000`,
    // target:'http://${targetUrl}:8086',
    // onProxyReq,
    onError
});
let proxyMiddlewareOne = proxy('/jtalk/message/**', {
    target: `http://${targetUrl}:8090`,
    // target:'http://127.0.0.1:8080',
    changeOrigin: true,
    logLevel: 'debug',
    // onProxyReq,
    onError
});

// 登录用，如果返回302 则跳转，饭后返回index.html
let proxyMiddlewareLogin = proxy((pathname, req) => {
    return pathname === '/' || pathname === '/index.htm';
}, {
    target: `http://${targetUrl}:8090`,
    // target:'http://127.0.0.1:8080',
    changeOrigin: true,
    logLevel: 'debug',
    proxyTimeout: 3000, 
    changeOrigin: true,
    pathRewrite: function (path, req) {
        return '/index.htm'
    },
    onProxyRes(proxyRes, req, res) {
        var _write = res.write;

        const statusCode = proxyRes.statusCode;
        console.log(statusCode);
        

        if (statusCode == 302) {
            return;
        }


        let indexHtml = fs.readFileSync(path.resolve(buildPath, './index.html'), 'utf-8');
        // 加入browsersync的代码
        indexHtml = indexHtml.replace('<body>',`<body>
        <script id="__bs_script__">//<![CDATA[
        document.write("<script async src='/browser-sync/browser-sync-client.js?v=2.18.12'><\\/script>".replace("HOST", location.hostname));
        //]]></script>`);
        
        proxyRes.statusCode = 200;
        return res.write = function (data) {
            try {
                _write.call(res, indexHtml);
            } catch (err) {
                console.error(err);
            }
        }

    },
    onProxyReq(proxyReq, req, res) {
        
        proxyReq.setHeader('host', req.headers.host)

    },
    onError: function (err, req, res) {
        const indexHtml = fs.readFileSync(path.resolve(buildPath, './index.html'), 'utf-8');
        res.write(indexHtml, 'utf-8');
        res.end();
    }
});

function onError(err, req, res) {

    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('transfer error' + err.message);
}

function parseCookies(str) {
    let arr = str.split(';');
    let obj = {};
    for (let item of arr) {
        let res = item.split('=');
        obj[res[0]] = res[1];
    }
    return obj;
}

gulp.task('server', function () {
    browsersSync({
        server: {
            baseDir: buildPath,
            middleware: [proxyMiddlewareOne, proxyMiddleware, proxyMiddlewareLogin]
        },
        port: serverPort,
        open: false
    })
})

gulp.task('watch', ['build', 'server'], function () {
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch('src/**/*.less', ['less']);
    gulp.watch('src/**/*.html', ['js']);
    gulp.watch('src/**/imgs/*', ['img']);
    gulp.watch('lib/**/*.js', ['lib']);
    gulp.watch('src/index.html', ['html']);
})

gulp.task('default')