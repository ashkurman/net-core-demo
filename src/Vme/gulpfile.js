var gulp     = require('gulp');
var sequence = require('run-sequence').use(gulp);
var del      = require('del');
var flatten  = require('gulp-flatten');
var tsc      = require('gulp-typescript');
var rename   = require('gulp-rename');

var paths = {
    output: './wwwroot/',
    node: './node_modules/'
};
paths.dst_scripts = paths.output + 'scripts/';
paths.tsSource    = './frontend/**/*.ts';
paths.dst_razor   = paths.output + 'views/';
paths.src_css     = './frontend/styles/**';
paths.dst_css  = paths.output + 'styles/';

/* Build sequence */
gulp.task('default', function (callback) {
    sequence('clean',['compile-typescript', 'copy-distros', 'copy-css'], callback);
});

/* Task list */
gulp.task('clean', task_clean);
gulp.task('copy-distros', task_copyDistros);
gulp.task('compile-typescript', task_tsc);
gulp.task('watch-ts', ['compile-typescript'], task_watchTs); //dont run this during regular build (it will never finish) - use task runner instead
gulp.task('copy-css', taskCopyCss);


function task_clean() {
    return del([paths.output + '**/', '!' + paths.output]);
}

function task_copyDistros() {
    return gulp.src(
        [
            paths.node + 'requirejs/require.js',
            paths.node + 'linq-es2015/dist/linq.js',
            paths.node + 'typescript-collections/dist/lib/umd.js',
            paths.node + 'signalr/jquery.signalR.js',
            paths.node + 'jquery/dist/jquery.js',
            paths.node + 'knockout/build/output/knockout-latest.js',
            paths.node + 'd3/build/d3.js'
        ])
        .pipe(
            rename(function (path) { // rename vendor source files to match typing file names in @types
                if (path.basename === 'linq') path.basename = 'linq-es2015';
                if (path.basename === 'umd') path.basename = 'typescript-collections';
                if (path.basename === 'jquery.signalR') path.basename = 'signalr';
                if (path.basename === 'knockout-latest') path.basename = 'knockout';
            })
        )
        .pipe( flatten() ) // remova any directory structure before saving files to output
        .pipe(gulp.dest(paths.dst_scripts));
}

function task_tsc() {
    var tsProject = tsc.createProject('tsconfig.json');

    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest(paths.dst_scripts));
}

function task_watchTs() {
    return gulp.watch(paths.tsSource, ['compile-typescript']);
}

function taskCopyCss() {
    return gulp.src(paths.src_css)
        .pipe(gulp.dest(paths.dst_css));
}