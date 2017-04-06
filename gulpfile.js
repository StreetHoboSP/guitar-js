var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', function () {
    gulp.src('src/guitar.js')
        .pipe(uglify())
        .pipe(rename('guitar.min.js'))
        .pipe(gulp.dest('src'));
});