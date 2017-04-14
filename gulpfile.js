var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    liveServer = require('gulp-live-server');

gulp.task('default', function () {
    gulp.src('src/guitar.js')
        .pipe(uglify())
        .pipe(rename('guitar.min.js'))
        .pipe(gulp.dest('src'));

    var server = liveServer.static('.', 8000);
    server.start();
});