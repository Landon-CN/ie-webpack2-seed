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
const gulpIf=require('gulp-if');
const html2Js=require('gulp-html-to-js');
const browsersSync = require('browser-sync');
const plumber = require('gulp-plumber')

const reload = browsersSync.reload;
const autoprefix = new lessAutoprefix({ browsers: ['ie >= 7','Chrome > 20','Firefox >= 20'] });

const development = process.env.NODE_ENV === 'development';
const mapDist = './';

gulp.task('js',function() {
    let task =  gulp.src('./src/**/*.js')
    .pipe(plumber())
    .pipe(gulpIf(development,sourcemaps.init()))
    .pipe(babel())
    .pipe(iife({
        // 关闭严格模式,可以考虑开发环境下打开
        useStrict:false
    }))
    .pipe(concat('index.js'))
    .pipe(gulpIf(development,sourcemaps.write(mapDist)))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream:true}))
});

gulp.task('lib',function(){
    return gulp.src(['./lib/jquery.js','./lib/*.js'])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('html',function(){
    let sources = gulp.src(['./dist/template.js','./dist/lib.js','./dist/*.js','./dist/*.css'],{read:false});
    let target = gulp.src('./src/index.html');
    return target.pipe(inject(sources,{ignorePath: 'dist'}))
    .pipe(gulp.dest('./dist'))
    .pipe(reload({stream:true}))
});

gulp.task('clean',function(){
    return gulp.src('./dist/**/*',{read:false})
    .pipe(clean());
});

gulp.task('less',function(){
    return gulp.src('./src/**/*.less')
    .pipe(plumber())
    .pipe(gulpIf(development,sourcemaps.init()))
    .pipe(less({
        plugins:[autoprefix]
    }))
    .pipe(postcss([
            oldIe({
                opacity:{
                    method:'copy'
                }
            })
        ]))
    .pipe(concat('index.css'))
    .pipe(gulpIf(development,sourcemaps.write(mapDist)))
    .pipe(gulp.dest('./dist'))
    .pipe(reload({stream:true}))
});

gulp.task('tpl',function(){
    gulp.src('./src/**/*.tpl.html')
    .pipe(html2Js({
        concat:'template.js',
        global:'window.templates'
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(reload({stream:true}))
});

gulp.task('build',['tpl','js','lib','less'],function(){
    gulp.run('html')
});

gulp.task('browsersync',function(){
    browsersSync({
        server:{
            baseDir:'./dist'
        }
    })
})

gulp.task('watch',['build','browsersync'],function () {
    gulp.watch('src/**/*.js',['js']);
    gulp.watch('src/**/*.tpl.html',['tpl']);
    gulp.watch('src/**/*.less',['less']);
    gulp.watch('src/index.html',['html'])
})

gulp.task('default')