/**
 * @file gulpfile
 * @author leon <ludafa@outlook.com>
 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const babelOptions = require('./package.json').babelBuild || {};
const babelHelpers = require('gulp-babel-external-helpers');

const sourcemaps = require('gulp-sourcemaps');

gulp.task('babel', function () {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel(babelOptions))
        .pipe(babelHelpers('babelHelpers.js', 'umd'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'));
});

gulp.task('clean', function () {
    return gulp
        .src('lib', {read: false})
        .pipe(clean());
});

gulp.task('build', ['babel'], function () {
    return gulp
        .src('package.json')
        .pipe(gulp.dest('lib'));
});

gulp.task('default', ['build']);
