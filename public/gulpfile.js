var gulp = require('gulp'), coffee = require('gulp-coffee'), haml = require('gulp-ruby-haml'), sass = require("gulp-ruby-sass");
var gutil = require("gulp-util")

var iced = require('gulp-iced-coffee');
var exec = require("exec");
// gulp.task('iced', function() {
//   exec(["iced",  "-o",  "./js", "-c", "./coffee"], function(err, out, code) {
//     console.log(out)
//   })
// });

gulp.task('default', function() {
  // place code for your default task here
});
gulp.task('coffee', function() {
  gulp.src('./coffee/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./js'))
});

gulp.task('haml', function() {
  gulp.src('./haml/**/*.haml').
       pipe(haml()).
       pipe(gulp.dest('./'));
});



gulp.task('sass', function() {
  return gulp.src('./sass/app.sass')
        .pipe(sass())
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest('./css'));
})

gulp.task('watch', function () {
	gulp.watch("./coffee/**/*.coffee", ['coffee']);
  gulp.watch("./haml/**/*.haml", ['haml']);
	gulp.watch("./sass/**/*.sass", ['sass']);
});