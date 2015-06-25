var gulp = require('gulp'), coffee = require('gulp-coffee'), haml = require('gulp-ruby-haml'), sass = require("gulp-sass");
var gutil = require("gulp-util")

var iced = require('gulp-iced-coffee');
var exec = require("exec");
gulp.task('iced', function() {
  gulp.src("./public/coffee/*.coffee").pipe(coffee({ bare: true })).pipe(gulp.dest("./public/js"))
});

gulp.task('siced', function() {
  exec(["iced",  "-o",  "./", "-c", "./coffee"], function(err, out, code) {
  })
});

gulp.task('default', ["watch"], function() {
  // place code for your default task here
});
// gulp.task('coffee', function() {
//   gulp.src('./coffee/*.coffee')
//     .pipe(coffee({bare: true}))
//     .pipe(gulp.dest('./js'))
// });

gulp.task('haml', function() {
  gulp.src('./public/haml/**/*.haml').
       pipe(haml()).
       pipe(gulp.dest('./public'));
});



gulp.task('sass', function() {
    exec("node-sass ./public/sass/app.sass ./public/css/app.css", function(err, out, code) {
      console.log(out)
    })
});

gulp.task('watch', function () {
  gulp.watch("./public/coffee/**/*.coffee", ['iced']);
	gulp.watch("./coffee/**/*.coffee", ['siced']);
  gulp.watch("./public/haml/**/*.haml", ['haml']);
	gulp.watch("./public/sass/**/*.sass", ['sass']);
});