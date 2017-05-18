var gulp  = require('gulp');  
var p     = require('gulp-load-plugins')();
var gutil = require('gulp-util');

var fs          = require('fs'),
    del         = require('del'),
    babelify    = require('babelify'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    browserify  = require('browserify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    glob        = require('glob'),
    es          = require('event-stream');

// Important variables used throughout the gulp file //

// Find errors!
function errorLog(error) {
  console.error.bind(error);
  this.emit('end');
}

// Browser Sync settings and config
var bs_reload = {
    stream: true
};

gulp.task('browserSync', function() {
  var Settings = {
    files: ['result/**'],
    port: 4000,
    server: { baseDir: 'result' },
    reload: ({ stream: true}),
    notify: false
  };

  browserSync(Settings)
});




// Function for plumber to handle errors
function customPlumber(errTitle) {
  return p.plumber({
    errorHandler: p.notify.onError({
      // Custom error titles go here
      title: errTitle || 'Error running Gulp',
      message: "<%= error.message %>",
      sound: 'Submarine',
    })
  });
}

gulp.task('browserify', function(done) {
  glob('javascript/main-**.js', function(err, files) {
    if(err) done(err);

    var tasks = files.map(function(entry) {
      return browserify({
          entries: [entry],
          outputStyle: 'compressed'
        })
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .pipe(source(entry))
        .pipe(gulp.dest('./result'))
        .pipe(browserSync.reload(bs_reload))
      });
    es.merge(tasks).on('end', done);
  })
});

gulp.task('watch', function(){
  gulp.watch('javascript/**/**/*.js', ['browserify']);
});



// Tasks that run multiple other tasks, including default //

gulp.task('default', function(callback) {
  runSequence(
    ['browserify'],
    ['browserSync', 'watch'],
    callback
  )
});
