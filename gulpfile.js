const gulp = require('gulp');
const babel = require('gulp-babel');
const iife = require('gulp-iife');
const concat = require('gulp-concat');1
const clean = require('gulp-rm');
const inject = require('gulp-inject');
const less = require('gulp-less');
const lessAutoprefix = require('less-plugin-autoprefix');
const postcss = require('gulp-postcss');
const oldIe = require('oldie');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf=require('gulp-if');
const browsersSync = require('browser-sync');
const plumber = require('gulp-plumber');
const sprites = require('postcss-sprites');
const path = require('path');
const uglyJs = require('gulp-uglify');
const rename = require('gulp-rename');
const inline = require('gulp-inline-template');

const reload = browsersSync.reload;
const autoprefix = new lessAutoprefix({ browsers: ['ie >= 7','Chrome > 20','Firefox >= 20'] });

const development = process.env.NODE_ENV === 'development';
const production = process.env.NODE_ENV === 'production';
const test = process.env.NODE_ENV === 'test';

const devPath = path.resolve(__dirname,'./dev');
const testPath = path.resolve(__dirname,'./test');
const proPath = path.resolve(__dirname,'./dist');
const serverPort = 3000; //访问端口

let buildPath = devPath;
if(production){
    buildPath = proPath
}else if(test){
    buildPath = testPath;
}


gulp.task('js',function() {
    let task =  gulp.src('./src/**/*.js')
    .pipe(plumber())
    .pipe(gulpIf(development || test,sourcemaps.init()))
    .pipe(inline())
    .pipe(babel())
    .pipe(iife({
        // 关闭严格模式,可以考虑开发环境下打开
        useStrict:true
    }))
    .pipe(concat('index.js'))
    .pipe(gulpIf(production|| test,uglyJs()))
    .pipe(gulpIf(development || test,sourcemaps.write('./')))
    .pipe(gulp.dest(buildPath))
    .pipe(reload({stream:true}))
});

gulp.task('lib',function(){
    return gulp.src(['./lib/es5-shim.js','./lib/es5-sham.js','./lib/jquery.js','./lib/jquery.ui.widget.js','./lib/*.js'])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest(buildPath));
});

let ignorePath = buildPath.substr(buildPath.lastIndexOf('/'));

gulp.task('html',function(){
    let sources = gulp.src([`${buildPath}/lib.js`,`${buildPath}/template.js`,`${buildPath}/*.js`,`${buildPath}/*.css`],{read:false});
    let target = gulp.src('./src/index.html');
    return target.pipe(inject(sources,{ignorePath: ignorePath}))
    .pipe(gulp.dest(buildPath))
    .pipe(reload({stream:true}))
});

gulp.task('clean',function(){
    return gulp.src(['./dist/**/*','./dev/**/*','./test/dev/**'],{read:false})
    .pipe(clean());
});

// post-sprite 配置项
const spriteOpts = {
    stylesheetPath: buildPath,
    spritePath: path.resolve(buildPath,'./imgs'),
};
gulp.task('less',function(){
    return gulp.src('./src/**/*.less')
    .pipe(plumber())
    .pipe(gulpIf(development || test,sourcemaps.init()))
    .pipe(less({
        plugins:[autoprefix]
    }))
    .pipe(postcss([
            oldIe({
                opacity:{
                    method:'copy'
                }
            }),
            sprites(spriteOpts)
        ]))
    .pipe(concat('index.css'))
    .pipe(gulpIf(development || test,sourcemaps.write('.')))
    .pipe(plumber.stop())
    .pipe(gulp.dest(buildPath))
    .pipe(reload({stream:true}))
});

gulp.task('img',function(){
    gulp.src(['./src/**/*.gif','./src/**/*.png','./src/**/*.jpeg','./src/**/*.jpeg'])
    .pipe(rename(function(file) {
        file.dirname = 'imgs';
        
    }))
    .pipe(gulp.dest(buildPath));
});

gulp.task('build',['img','tpl','js','lib','less'],function(){
    gulp.run('html')
});

gulp.task('browsersync',function(){
    browsersSync({
        server:{
            baseDir:buildPath
        },
        port: serverPort
    })
})

gulp.task('watch',['build'],function () {
    gulp.run('browsersync')
    gulp.watch('src/**/*.js',['js']);
    gulp.watch('src/**/*.less',['less']);
    gulp.watch('src/**/*.tpl.html',['tpl']);
    gulp.watch('src/**/img/*',['img']);
    gulp.watch('lib/**/*.js',['lib']);
    gulp.watch('src/index.html',['html']);
})

gulp.task('default')