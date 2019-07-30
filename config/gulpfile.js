
// const webpack     = require('webpack-stream')
const gulp        = require('gulp')
const path        = require('path')
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');

const pageConfigOption = require('./webpack.config.js');


gulp.task('build', function(){
	return gulp.src(path.resolve(__dirname, '../src'))
      // .pipe(gulpWebpack(pageConfigOption))
      .pipe(gulpWebpack(pageConfigOption, webpack))
      .pipe(gulp.dest(path.resolve(__dirname, '../dist2')))
});