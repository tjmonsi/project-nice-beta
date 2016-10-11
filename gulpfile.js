var gulp = require('gulp');
var watch = require('gulp-watch');
var nodeSass = require('node-sass');
var path = require('path');
var fs = require('fs');
var map = require('map-stream');
var basePath = "";
var excludeDir = basePath+"bower_components/";
var ext = "**/*.scss";
var polymerPath = 'bower_components/polymer/polymer.html'

/**
 * We need to specify to nodeSass the include paths for Sass' @import
 * command. These are all the paths that it will look for it. 
 * 
 * Failing to specify this, will NOT Compile your scss and inject it to 
 * your .html file.
 * 
 */
var includePaths = ['src/components/**/', 'src/pages/**/', 'src/styles/**/'];

var injectSass = function () {
  /* Original creator: David Vega. I just modified
  * it to take advantage of the Polymer 1.1's shared styles. 
  * 
  * This will look all the files that are inside:
  * app/elements folder. You can change this to match 
  * your structure.  Note, this gulp script uses convention
  * over configuration. This means that if you have a file called
  * my-element-styles.html you should have a file called 
  * my-element-styles.scss
  * 
  * Note #2: 
  * We use "!" (Exclamation Mark) to exclude gulp from searching these paths. 
  * What I'm doing here, is that Polymer Starter Kit has inside its app folder
  * all the bower dependencies (bower_components). If we don't specify it to 
  * exclude this path, this will look inside bower_components and will take a long time
  * (around 7.4 seconds in my machine) to replace all the files. 
  */
  //Uncomment if you want to specify multiple exclude directories. Uses ES6 spread operator.
  //return gulp.src([basePath+ext,...excludeDirs])
  
  console.log('Starting');
    
  return gulp.src([basePath + 'src/components/' + ext, basePath + 'src/pages/' + ext, basePath + 'src/styles' + ext, '!'+excludeDir+ext])
    .pipe(map(function(file, cb) {

      if (path.dirname(file.path) === path.resolve('src/styles')) {
        return cb();
      } 
      var styleName = path.basename(file.path, '.scss');
      
      fs.readFile(file.path, function(err, data) {
        if (err || !data) {
          console.log(err)
          return cb();
        }
        
        nodeSass.render({
          data: data.toString(),
          includePaths: includePaths,
          // outputStyle: 'compressed'
        }, function(err, compiledScss) {
          if (err || !compiledScss) {
            console.log(err)
            return cb();
          }

          var newPolymerPath = (path.relative(path.dirname(file.path), path.resolve(polymerPath)));
          
          var string = `<link rel="import" href="${newPolymerPath}">\n<dom-module id="${styleName}">\n<template>\n<style>\n` +
            compiledScss.css.toString() + 
            '\n</style>\n</template>\n</dom-module>'
            
          fs.writeFile(path.join(path.dirname(file.path), styleName + '.html'), string, 'utf8', function(err) {
            if (err) {
              console.log(err);
            }
            return cb()
          })
        })
      })
    }))
};


gulp.task('default', ['injectSass', 'watchSass'])

gulp.task('watchSass', function(){
  watch(['src/**/*.scss'], injectSass);  
});

//This is currently not used. But you can enable by uncommenting 
// " //return gulp.src([basePath+ext,...excludeDirs])" above the return.
// var excludeDirs = [`!${basePath}bower_components/${ext}`,`!${basePath}images/${ext}`];

gulp.task('injectSass', injectSass);

