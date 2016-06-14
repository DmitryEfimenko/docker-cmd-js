var gulp = require('gulp');
var path = require('path');
var del = require('del');
var colors = require('colors');
var failFast = require('jasmine-fail-fast');
var $ = require('gulp-load-plugins')();

gulp.task('clean', function (cb) {
    del(['dist/']).then(path => { cb(); });
});

gulp.task('compileSrc', () => {
    var tsProject = $.typescript.createProject('./tsconfig.json', {
        removeComments: true,
        noExternalResolve: false
    });

    var tsResult = gulp.src(['./src/**/*.ts', './typings/**/*.ts'])
        .pipe($.typescript(tsProject));
    
    tsResult.dts
        .pipe(gulp.dest('./dist/typings'));

    return tsResult.js
        .pipe(gulp.dest('./dist/src'));
});

gulp.task('compileTests', () => {
    var tsProject = $.typescript.createProject('./tsconfig.json', {
        removeComments: true,
        noExternalResolve: false
    });

    var tsResult = gulp.src(['./spec/**/*.ts', './typings/**/*.ts'])
        .pipe($.typescript(tsProject));
    
    return tsResult.js
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-dockerfiles', function() {
    return gulp.src(['./spec/**/*.sh', './spec/**/!(*.ts)'])
        .pipe(gulp.dest('./dist/spec'));
});

gulp.task('test', () => {
    $.jasmine.jasmine.getEnv().addReporter(failFast.init());
    return gulp.src('./dist/spec/*.js')
        .pipe($.jasmine({ verbose: true }))
        .on('error', swallowError)
        .on('end', addSpaces);
});

gulp.task('ts-lint', function () {
  return gulp.src('./src/**/*.ts')
    .pipe($.tslint())
    .pipe($.tslint.report('full', {emitError: false}));
});

gulp.task('watch', () => {
    gulp.watch('./src/**/*.ts').on('change', tsLintFile);
    gulp.watch('./src/**/*.ts').on('change', compileFile);
    gulp.watch('./spec/**/*.ts').on('change', compileFile);
    gulp.watch('./dist/spec/**/*.js').on('change', runTestFile);
});

gulp.task('compile', gulp.parallel('compileSrc', 'compileTests'));

gulp.task('build', gulp.series('clean', 'compile', 'copy-dockerfiles'));

gulp.task('default', gulp.series('build', 'test', 'ts-lint'));

function tsLintFile(file) {
    console.log(colors.yellow('[gulp watch - tsLint]' + ' ' + colors.cyan(file)));
    gulp.src(file)
        .pipe($.tslint())
        .pipe($.tslint.report('full', {emitError: false}));
}

function compileFile(file) {
    console.log(colors.yellow('[gulp watch - compileFile]' + ' ' + colors.cyan(file) ));
    var tsProject = $.typescript.createProject('./tsconfig.json', {
        removeComments: true,
        noExternalResolve: false,
        rootDir: '.'
    });

    var tsResult = gulp.src([file, './typings/**/*.ts'])
        .pipe($.typescript(tsProject));

    return tsResult.js
        .pipe(gulp.dest('./dist'));
}

function runTestFile(file) {
    console.log(colors.yellow('[gulp watch - testFile]') + ' ' + colors.cyan(file));
    gulp.src(file)
        .pipe($.jasmine({ verbose: true }))
        .on('error', swallowError)
        .on('end', addSpaces);
}

function swallowError(error) {
    if (error) console.log(error.stack);
    this.emit('end');
}

function addSpaces() {
    console.log('################################################################################');
    for (var i = 0; i < 5; i++) {
        console.log('');
    }
}