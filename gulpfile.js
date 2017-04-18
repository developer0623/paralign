var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var inject = require('gulp-inject');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: [
    './www/js/*.js',
    './www/js/*/*.js'
  ]
};

gulp.task('default', ['sass', 'inject']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['inject']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});



gulp.task('inject', function () {
  var target  = gulp.src('./www/index.html');

  // styles
  target.pipe(
      inject(
        gulp.src([
          './www/css/*.css',
          '!./www/css/main.css',
          '!./www/css/ionic.app.css',
          '!./www/css/ionic.app.min.css',
          '!./www/css/ionicons.css',
          '!./www/css/ionicons.min.css'
        ], {read: false})
        ,{
          name: 'styles',
          addRootSlash: false,
          ignorePath: 'www'
        }))
    .pipe(gulp.dest('./www'));


  // ng-app
  target.pipe(
      inject(
        gulp.src([
          './www/js/app.js',
          './www/js/app.config.js',
          './www/js/app.routes.js'
        ], {read: false})
        ,{
          name: 'ng-app',
          addRootSlash: false,
          ignorePath: 'www'
        }))
    .pipe(gulp.dest('./www'));


  // ng-modules
  target.pipe(
      inject(
        gulp.src([
          './www/js/directives/*.js',
          './www/js/factories/*.js',
          './www/js/filters/*.js',
          './www/js/resources/*.js',
          './www/js/services/*.js'
        ], {read: false})
        ,{
          name: 'ng-modules',
          addRootSlash: false,
          ignorePath: 'www'
        }))
    .pipe(gulp.dest('./www'));


  // ng-controllers
  target.pipe(
      inject(
        gulp.src([
          './www/js/controllers/*.js',
        ], {read: false})
        ,{
          name: 'ng-controllers',
          addRootSlash: false,
          ignorePath: 'www'
        }))
    .pipe(gulp.dest('./www'));
});