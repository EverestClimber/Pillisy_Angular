var gulp         = require('gulp');
var gls          = require('gulp-live-server');
var jshint       = require('jshint');
var livereload   = require('gulp-livereload');
var EXPRESS_ROOT = __dirname;
var env          = process.env.NODE_ENV

function notifyLivereload(event) {
    // `gulp.watch()` events provide an absolute path
    // so we need to make it relative to the server root
    var fileName = require('path').relative(EXPRESS_ROOT, event.path);

    lr.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task('serve', function () {
    
    var server = gls.new('bin/www', {env: { NODE_ENV: env}});
    server.start();

    //livereload.listen();

    gulp.watch(['views/*', 'public/**/*'], function (file) {
        server.notify.apply(server, [file]);
    });

    gulp.watch(['bin/www', 'app.js', 'routes/*'], function (file) {
        server.start.apply(server);
        server.notify.apply(server, [file]);
    });

});

gulp.task('default', ['serve'], function() {
    console.log("Running Gulp");
});

/*
// Default task that will be run
// when no parameter is provided
// to gulp
gulp.task('default', function () {
    startExpress();
    startLivereload();
    gulp.watch('*.html', notifyLivereload);
});*/