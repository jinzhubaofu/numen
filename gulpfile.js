/**
 * @file gulpfile
 * @author leon <ludafa@outlook.com>
 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('babel', function() {
    return gulp
        .src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'));
});

gulp.task('build', ['babel'], function() {
    return gulp.src('package.json').pipe(gulp.dest('lib'));
});

gulp.task('default', ['build']);
