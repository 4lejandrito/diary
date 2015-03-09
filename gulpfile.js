var gulp = require('gulp');
var browserify = require('browserify');
var glob = require('glob');
var shell = require('gulp-shell');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var nodemon = require('gulp-nodemon');
var reactify = require('reactify');
var watchify = require('watchify');
var less = require('gulp-less');
var jshint = require('gulp-jshint');

var bundle = function(path, dest, debug) {
    var b = browserify({
        entries: glob.sync(path),
        extensions: ['.js', '.jsx'],
        debug: debug,
        cache: {},
        packageCache: {},
        fullPaths: debug,
        paths: ['./node_modules','./src/frontend/js']
    });
    if (debug) b = watchify(b);
    b.transform(reactify);

    function bundle() {
        return b.bundle()
        .pipe(plumber())
        .pipe(source(dest))
        .pipe(buffer())
        .pipe(gulpif(!debug, uglify()))
        .pipe(gulp.dest('.'));
    }

    b.on('update', bundle);
    return bundle();
};

gulp.task('frontend:less', function() {
  return gulp.src('src/frontend/less/main.less')
    //.pipe(sourcemaps.init())
    .pipe(less())
    //.on('error', handleErrors)
    //.pipe(autoprefixer({cascade: false, browsers: ['last 2 versions']}))
    //.pipe(sourcemaps.write())
    .pipe(gulp.dest('src/public'));
});
gulp.task('frontend:less:watch', ['frontend:less'], function() {
    gulp.watch(['src/frontend/less/**'], ['frontend:less']);
});

gulp.task('frontend:js:watch', function () {
    return bundle('./src/frontend/js/app.jsx', 'src/public/index.js', true);
});
gulp.task('frontend:js', function () {
    return bundle('./src/frontend/js/app.jsx', 'src/public/index.js', false);
});


gulp.task('frontend', ['frontend:js', 'frontend:less']);
gulp.task('frontend:watch', ['frontend:js:watch', 'frontend:less:watch']);

gulp.task('backend:lint', function () {
    return gulp.src(['src/**/*.js*', '!src/frontend/**/*.js*', '!src/public/**/*.js*'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('backend', ['backend:lint']);
gulp.task('backend:watch', function () {
    return nodemon({
        script: 'src/app.js',
        ignore: ['src/frontend/**', 'src/public/**']
    });
});

gulp.task('watch', ['frontend:watch', 'backend:watch']);

gulp.task('editor', function() {
    return gulp.src('.').pipe(shell('atom'));
});

gulp.task('develop', ['editor', 'watch']);
gulp.task('default', ['frontend', 'backend']);
