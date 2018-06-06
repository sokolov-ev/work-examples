'use strict';

const gulp    = require('gulp');
const plugins = require('gulp-load-plugins')();

gulp.task('default', ['watch']);

gulp.task('watch', function(event){
    gulp.watch(['app/**/*.scss'], ['sass']);
});

gulp.task('vendor-js', vendorJs(gulp, plugins));
gulp.task('sass', sass(gulp, plugins));
gulp.task('inject', inject(gulp, plugins));

//////////

function vendorJs(gulp, plugins) {
    return function() {
        gulp.src([
            'bower_components/angular/angular.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-flash-alert/dist/angular-flash.js',
            'bower_components/angular-messages/angular-messages.js',
            'bower_components/angular-smart-table/dist/smart-table.js',
            'bower_components/angular-ui-select/dist/select.js',
            'bower_components/lodash/dist/lodash.js',
            'bower_components/angular-local-storage/dist/angular-local-storage.js',
        ])
        .pipe(plugins.concat('vendor.js'))
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify())
        .pipe(gulp.dest('assets/js'));
    }
}

function sass(gulp, plugins) {
    return function() {
        gulp.src('app/**/*.scss')
            .pipe(plugins.sass({outputStyle: 'compressed'}))
            .pipe(plugins.autoprefixer({browsers: ['last 2 versions']}))
            .pipe(plugins.concat('vendor.css'))
            .pipe(gulp.dest('assets/css'));
    }
}
function inject(gulp, plugins) {
    return function() {
        let sources = gulp.src(['app/**/*.js'], {read: false});

        gulp.src('index.html')
            .pipe(plugins.inject(sources))
            .pipe(gulp.dest('./'));
    }
}
