import * as gulp from 'gulp';
import * as path  from 'path';
import * as del from 'del';
import * as colors from 'colors';
var failFast = require('jasmine-fail-fast');
var TerminalReporter = require('jasmine-terminal-reporter');
var $ = require('gulp-load-plugins')();

let typesPath = './node_modules/@types/**/*.d.ts';

gulp.task('clean', function (cb) {
  del(['dist/']).then(path => { cb(); });
});


gulp.task('compile', () => {
  var tsProject = $.typescript.createProject('./tsconfig.json', {
    removeComments: true
  });

  var tsResult = gulp.src(['./src/**/*.ts'])
    .pipe(tsProject());

  tsResult.dts
    .pipe(gulp.dest('./dist/typings'));

  return tsResult.js
    .pipe(gulp.dest('./dist/src'));
});

gulp.task('copy-dockerfiles', function () {
  return gulp.src(['./src/spec/**/*.sh', './src/spec/**/!(*.ts)'])
    .pipe(gulp.dest('./dist/src/spec'));
});

gulp.task('test', () => {
  var terminalReporter = new TerminalReporter({ isVerbose: true, showColors: true, includeStackTrace: false });

  return gulp.src('./dist/src/spec/*.js')
    .pipe($.jasmine({
      reporter: [terminalReporter],
      config: { spec_dir: 'spec', helpers: ['./helpers/**/*.js'] }
    }))
    .on('error', swallowError)
    .on('end', addSpaces);
});

gulp.task('ts-lint', function () {
  return gulp.src('./src/**/*.ts')
    .pipe($.tslint())
    .pipe($.tslint.report('full', { emitError: false }));
});

gulp.task('watch', () => {
  (<any>gulp).watch('./src/**/*.ts').on('change', tsLintFile);
  (<any>gulp).watch('./src/**/*.ts').on('change', compileFile);
  (<any>gulp).watch('./dist/src/spec/**/*.js').on('change', runTestFile);
});

gulp.task('build', (<any>gulp).series('clean', 'compile', 'copy-dockerfiles'));

gulp.task('default', (<any>gulp).series('build', 'test', 'ts-lint'));

function tsLintFile(file) {
  console.log(colors.yellow('[gulp watch - tsLint]' + ' ' + colors.cyan(file)));
  gulp.src(file)
    .pipe($.tslint())
    .pipe($.tslint.report('full', { emitError: false }));
}

function compileFile(file) {
  console.log(colors.yellow('[gulp watch - compileFile]' + ' ' + colors.cyan(file)));
  var tsProject = $.typescript.createProject('./tsconfig.json', {
    removeComments: true,
    noResolve: false
  });

  var tsResult = gulp.src([file, typesPath])
    .pipe(tsProject());

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
  if (error) { console.log(error.stack); }
  this.emit('end');
}

function addSpaces() {
  console.log('################################################################################');
  for (var i = 0; i < 5; i++) {
    console.log('');
  }
}
