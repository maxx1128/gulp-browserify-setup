var gulp          = require('gulp');  
var p             = require('gulp-load-plugins')();
var gutil         = require('gulp-util');

var fs            = require('fs'),
    del           = require('del'),
    runSequence   = require('run-sequence'),
    browserify    = require('browserify'),
    watchify      = require('watchify'),
    source        = require('vinyl-source-stream'),
    buffer        = require('vinyl-buffer');

// Important variables used throughout the gulp file //

// Configurations for different file paths
var config = {
    siteRoot: '_site',
    projectPath: '_site/',
    AssetsPath: 'assets/',
    componentPath: 'components/'
}

// Set to true if in production. Files will go to the 'app' folder.
// Set to false if launching. Files will go to the 'dist' folder, clean and ready
var prod = true;

// Find errors!
function errorLog(error) {
  console.error.bind(error);
  this.emit('end');
}

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

// Browser Sync settings and config
var bs_reload = {
    stream: true
};

// Browserify for creating javascript bundle
var bundler = browserify({
    // Required watchify args
    cache: {},
    packageCache: {},
    fullPaths: true,
    // Browserify options
    entries: ['main.js']
  });

var bundle = function() {
  return bundler
    .bundle()
    .pipe(customPlumber('Error running Scripts'))
    .on('error', errorLog)
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(p.uglify())
    .pipe(gulp.dest('result'))
    .pipe(p.notify({ message: 'JS Uglified!', onLast: true }))
}

gulp.task('browserify', function() {
  return bundle();
});

gulp.task('watch-js', function() {
  var watchifyBundler = watchify(bundler);
  watchifyBundler.on('update', bundle);

  return bundle();
});





// Tasks that run multiple other tasks, including default //

gulp.task('default', function(callback) {
  runSequence(
    ['browserify'],
    ['watch-js'],
    callback
  )
});
