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
const serverPort = 3001; //访问端口

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
        .pipe(inline())
        .pipe(babel())
        .pipe(iife({
            // 关闭严格模式,可以考虑开发环境下打开
            useStrict: true
        }))
        .pipe(concat('index.js'))
        .pipe(gulpIf(production || test, uglyJs()))
        .pipe(gulpIf(development || test, sourcemaps.write('./')))
        .pipe(gulp.dest(buildPath))
        .pipe(reload({
            stream: true
        }))
});

gulp.task('lib', function () {
    return gulp.src(['./lib/es5-shim.js', './lib/es5-sham.js', './lib/jquery.js', './lib/jquery.ui.widget.js', './lib/*.js'])
        .pipe(concat('lib.js'))
        .pipe(gulp.dest(buildPath));
});

let ignorePath = buildPath.substr(buildPath.lastIndexOf('/'));

gulp.task('html', function () {
    let sources = gulp.src([`${buildPath}/lib.js`, `${buildPath}/template.js`, `${buildPath}/*.js`, `${buildPath}/*.css`], {
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
    return gulp.src(['./dist/**/*', './dev/**/*', './test/dev/**'], {
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
        }).on('error',function (err) { 
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
        .pipe(plumber.stop())
        .pipe(gulp.dest(buildPath))
        .pipe(reload({
            stream: true
        }))
});

gulp.task('img', function () {
    gulp.src(['./src/**/*.gif', './src/**/*.png', './src/**/*.jpeg', './src/**/*.jpg'])
        .pipe(rename(function (file) {
            file.dirname = 'imgs';
        }))
        .pipe(gulp.dest(buildPath));
});

gulp.task('build', ['img', 'js', 'lib', 'less'], function () {
    gulp.run('html');
});

let proxyMiddleware = proxy('/jtalk/**',{
    target:'http://10.9.46.136:8000',
    // target:'http://10.9.46.139:8086',
    onProxyReq,
    onError
});
let proxyMiddlewareOne = proxy('/jtalk/message/**',{
    target:'http://10.9.46.136:8090',   
    // target:'http://127.0.0.1:8080',
    changeOrigin: true,
    logLevel:'debug',
    onProxyReq,
    onError
});

let jdCookie = '__jda=122270672.1497519615380308929381.1497519615.1497519615.1497519615.1; __jdb=122270672.1.1497519615380308929381|1.1497519615; __jdc=122270672; __jdv=122270672|direct|-|none|-|1497519615381; _jrda=1; _jrdb=1497519615734; 3AB9D23F7A4B3C9B=737HHH2EQTV6L42CUCTOLO7D57QRSPB7JXGOEWTTPJBYBMU5GWPKSUEWQYP2QU3IVL2UH6NIL7FHVLMEOMBQHQVPBM; __jdu=1497519615380308929381; TrackID=1HtPUTere-p3RkbJDaM3-5JRFojD0KlvmiuJNtmdV-pzManFQBimMGZe8_otvhjEhFsRMlc0IOiLvA_KP7Mj0WulM2aLe0c7G2JBZuzhDWOds_qxobd5Sk4L7w1plBTZ2; pinId=EawWrQR5yWGKVbYQjlaCPg; pin=diaozhatiao; unick=diaozhatiao; thor=C27FFE83D170611C02BA257A31DAE1AA97A26C782C45259522DE150E07B3FB099F877F6FEACC79B94CA4DA428234F044842B6D063E9D6A95EDAA5CFDD40DAD27CC17FA725E8C1CD370457AB2CE9C42179A46B9279A8805DFC19A0FCBCB441A96E70E85ACEB4796DBB1D4C8C59B49DAF57A7C979F6AD4507147410C190D330A98C1B1805631E3FD5C7DDCA287932157EB; lighting=6059ABE6E86025038093AB9E809EAFE47C939AA31AFCC8706600420FA34918142C41E0A8F6517D109C10285969CC342365F1BCF762C091AA50787BDFE30616AA1B407A0AB027B54729351B76407C71EC4E92CB695AAE6F4CC1E6F32F8E8DF28935CFE8B7736737E05972269E5E2DA895B3ECF601F8CC1488EA1BC820B3FF47E00F4BDCA1F151FFA7D0D6F5D9D71F13AC; _tp=33cA%2FOI8HcW1I7YG5JFJZA%3D%3D; logining=1; _pst=diaozhatiao; ceshi3.com=uqZwoxDmzM88mrZFR7BJP_99raa4slds6fdx6ezMTc4; __jda=122270672.1497519615380308929381.1497519615.1497519615.1497519615.1; __jdb=122270672.1.1497519615380308929381|1.1497519615; __jdc=122270672; __jdv=122270672|direct|-|none|-|1497519615381; _jrda=1; _jrdb=1497519615734; 3AB9D23F7A4B3C9B=737HHH2EQTV6L42CUCTOLO7D57QRSPB7JXGOEWTTPJBYBMU5GWPKSUEWQYP2QU3IVL2UH6NIL7FHVLMEOMBQHQVPBM; __jdu=1497519615380308929381; TrackID=1HtPUTere-p3RkbJDaM3-5JRFojD0KlvmiuJNtmdV-pzManFQBimMGZe8_otvhjEhFsRMlc0IOiLvA_KP7Mj0WulM2aLe0c7G2JBZuzhDWOds_qxobd5Sk4L7w1plBTZ2; pinId=EawWrQR5yWGKVbYQjlaCPg; pin=diaozhatiao; unick=diaozhatiao; thor=C27FFE83D170611C02BA257A31DAE1AA97A26C782C45259522DE150E07B3FB099F877F6FEACC79B94CA4DA428234F044842B6D063E9D6A95EDAA5CFDD40DAD27CC17FA725E8C1CD370457AB2CE9C42179A46B9279A8805DFC19A0FCBCB441A96E70E85ACEB4796DBB1D4C8C59B49DAF57A7C979F6AD4507147410C190D330A98C1B1805631E3FD5C7DDCA287932157EB; lighting=6059ABE6E86025038093AB9E809EAFE47C939AA31AFCC8706600420FA34918142C41E0A8F6517D109C10285969CC342365F1BCF762C091AA50787BDFE30616AA1B407A0AB027B54729351B76407C71EC4E92CB695AAE6F4CC1E6F32F8E8DF28935CFE8B7736737E05972269E5E2DA895B3ECF601F8CC1488EA1BC820B3FF47E00F4BDCA1F151FFA7D0D6F5D9D71F13AC; _tp=33cA%2FOI8HcW1I7YG5JFJZA%3D%3D; logining=1; _pst=diaozhatiao; ceshi3.com=uqZwoxDmzM88mrZFR7BJP_99raa4slds6fdx6ezMTc4; io=WVDInM5drXE0pucUAAAAuser-key=c6630f81-a37c-43da-89b6-9512521d3c2e sid=ef5506bf5202a17f45609c59f4e271c1 _ga=GA1.2.935388402.1497323101 yys=CB9178D2AAB13B25D201183B99C948EA101F91BF290DF49BD3841A73281B9C40F0FFC21D62C81C5634B8AC02BA7A6C65 unpl=V2_ZzNtbUQEEBN9ARVQc0ldDGIHEF1LB0tHcF1GUntMWwFnBBRfclRCFXMUR1NnGVkUZgsZX0tcQBxFCEdkexhdBGYKGlRKVXMVcQ8oVRUZVQAJbUANLAcTez1RKFIVGlwHVzMRXXJXQiV1DU5TchFbB24BG1hGV0odcwBFUnoRWjVXBCJtlf7tw%2fmuku3Rzu6HVwcUXkRTQhR0C3ZVSxhsTgkCX11HX0QcfQ9EXXkQWQFnChpbSlRFFH0OdlVLGg%3d%3d CCC_SE=ADC_mpQ8BIZb42Bdgdr%2fh6JCK39RiZFHtNjU4QKOemuNpbhc9wmW96yz01oEGWJ7VLlLQq%2fIOrALZ8hSHZAfziw7S8BwgoAJcoOCkp46E39Aa6P34cgBD%2fFTKS4k9NQqdaTBPDG1mmGmRnQ3K0QEhU8b7TRtwx3ddc9KUxtTFh2Eshi9Z0JfyGQjnta6xASiyJDTG%2fkqGTao988CVaxd8khHTZSxxQGexv2P%2fD8nqy2Ib3WwrpB%2bbqU1q8tHnH33DeeufMLEniWBu29iRE4NacO%2fS0UhJByei8bOAx0SBlmRmGxwbs9nBJ428e%2b3FQy%2bs%2fG1OOoBKKibNhejVvWl6pIudk%2fJVSl0v3YRc14vUiDhZERhy%2fkxzJpq3UfraLwfzonBtBnlG7FatHWK%2bY0BYssWV6QOrQkIqD5xovjI4cELIZm1csEci84eXC0ldg7SzTFclKacv5MtrRUC9zrmAiCiKZrhvFL16m7zywJL%2bt%2bwb6gbC1ybn5dqNf4gMnQMJeT%2fH7q%2bl%2btMNia7AtJg6uWrcPdl31%2bGZ9TvGNIrl9oiNA4426GAICtACsS1%2f%2b1DXU%2bRm7ERHnrC3oeYpsfkKrrsGurXKvWPt5tasSNqaBUswho%3d __jdv=122270672|kong|t_1000027280_1020|zssc|dc5f874f-826b-4560-9814-dc5954ae7229-p_1999-pr_183-at_1020|1497405659680 cn=9 ipLoc-djd=22-1930-50947-52199.138678834 ipLocation=%u56DB%u5DDD areaId=22 erp1.jd.com=6F0443DD4852016F31B90240CAADA2912B5B0631E555305EEF1207080EA9B9A96E14ABC0CB86FF007D5F68DB6BAFA2E0732287A4B8563ABF7D0A0279461B49385BCCAD43C51287FAFA5B301EB222D99E sso.jd.com=b34351cb22f5492884077de7ad67c5b5 TrackID=1I7KLl7hqyDdrTxh8E0-RggOTueMNJWCtxGCWlHUJsLmMMKpkCdmNjCBWxMtOd4A2jtOE3v8lIO07nt2niCL0kb0ATUPLavZqCpELXYg2NCzuxmbX7Xk5k9I9Uhf1c5rx pinId=hvKOpefBdM4TJGeAWC__Sw pin=mzefibp2018 unick=mzefibp2018 _tp=NKh0sIKuyftq8otqSyZBCQ%3D%3D _pst=mzefibp2018 ceshi3.com=103 wlfstk_smdl=n8rjd13v29c0cmhmya6gdagu9gq2u2zh _jrda=7 thor=8EEDBCE829C2008716749B2FC0DD139A81235E8A1FFE5835FADBB44F17EE3A360DCF3A1792725532378ED0F8AD6F3D55E2D578719DF6281CEFDAC39E9C4ED7CCD97A9A9844A83F23C605E2E25DE75B64A1E1B0057CF3475FD9FD55DC4577FDA36EF2C2CFB87AAFB6FFCBC42F95B8B90A3A9978672F475885E044A24B901DE7AE3FC6EE9185B11A81ADD56C6DBD840F6D 3AB9D23F7A4B3C9B=BZHEGVDEBVBV6TWGO7BX2EKU7AK2UYPHANSCATHICJ373RUETOZ6F33SQOSSPQPASTLVZXZOYO5IFYEAFKSGYYP7KE __jda=138814566.14968963838451897927097.1496896384.1497492745.1497505811.36 __jdc=138814566 __jdu=14968963838451897927097; __jda=122270672.1497519615380308929381.1497519615.1497519615.1497519615.1; __jdb=122270672.1.1497519615380308929381|1.1497519615; __jdc=122270672; __jdv=122270672|direct|-|none|-|1497519615381; _jrda=1; _jrdb=1497519615734; 3AB9D23F7A4B3C9B=737HHH2EQTV6L42CUCTOLO7D57QRSPB7JXGOEWTTPJBYBMU5GWPKSUEWQYP2QU3IVL2UH6NIL7FHVLMEOMBQHQVPBM; __jdu=1497519615380308929381; TrackID=1HtPUTere-p3RkbJDaM3-5JRFojD0KlvmiuJNtmdV-pzManFQBimMGZe8_otvhjEhFsRMlc0IOiLvA_KP7Mj0WulM2aLe0c7G2JBZuzhDWOds_qxobd5Sk4L7w1plBTZ2; pinId=EawWrQR5yWGKVbYQjlaCPg; pin=diaozhatiao; unick=diaozhatiao; thor=C27FFE83D170611C02BA257A31DAE1AA97A26C782C45259522DE150E07B3FB099F877F6FEACC79B94CA4DA428234F044842B6D063E9D6A95EDAA5CFDD40DAD27CC17FA725E8C1CD370457AB2CE9C42179A46B9279A8805DFC19A0FCBCB441A96E70E85ACEB4796DBB1D4C8C59B49DAF57A7C979F6AD4507147410C190D330A98C1B1805631E3FD5C7DDCA287932157EB; lighting=6059ABE6E86025038093AB9E809EAFE47C939AA31AFCC8706600420FA34918142C41E0A8F6517D109C10285969CC342365F1BCF762C091AA50787BDFE30616AA1B407A0AB027B54729351B76407C71EC4E92CB695AAE6F4CC1E6F32F8E8DF28935CFE8B7736737E05972269E5E2DA895B3ECF601F8CC1488EA1BC820B3FF47E00F4BDCA1F151FFA7D0D6F5D9D71F13AC; _tp=33cA%2FOI8HcW1I7YG5JFJZA%3D%3D; logining=1; _pst=diaozhatiao; ceshi3.com=uqZwoxDmzM88mrZFR7BJP_99raa4slds6fdx6ezMTc4';

function onError(err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
}
function onProxyReq(proxyReq,req,res) {

    proxyReq.setHeader('Cookie',jdCookie);
    
}

function parseCookies(str) {
    let arr = str.split(';');
    let obj = {};
    for(let item of arr){
        let res = item.split('=');
        obj[res[0]]=res[1];
    }
    return obj;
}

gulp.task('server', function () {
    browsersSync({
        server: {
            baseDir: buildPath,
            middleware:[proxyMiddlewareOne,proxyMiddleware]
        },
        port: serverPort,
         open: false
    })
})

gulp.task('watch', ['build','server'], function () {
    gulp.watch('src/**/*.js', ['js']);
    gulp.watch('src/**/*.less', ['less']);
    gulp.watch('src/**/*.html', ['js']);
    gulp.watch('src/**/imgs/*', ['img']);
    gulp.watch('lib/**/*.js', ['lib']);
    gulp.watch('src/index.html', ['html']);
})

gulp.task('default')