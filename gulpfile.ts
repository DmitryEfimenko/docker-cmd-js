import * as gulp from 'gulp';
import * as path from 'path';
import * as del from 'del';
import * as colors from 'colors';
import * as failFast from 'jasmine-fail-fast';
import * as TerminalReporter from 'jasmine-terminal-reporter';
import * as plugins from 'gulp-load-plugins';
const $ = plugins();

const typesPath = './node_modules/@types/**/*.d.ts';

gulp.task('clean', (cb) => {
  del(['dist/']).then(path => { cb(); });
});

gulp.task('compile', () => {
  const tsProject = $.typescript.createProject('./tsconfig.json', {
    removeComments: true
  });

  const tsResult = gulp.src(['./src/**/*.ts'])
    .pipe(tsProject());

  tsResult.dts
    .pipe(gulp.dest('./dist/typings'));

  return tsResult.js
    .pipe(gulp.dest('./dist/src'));
});

gulp.task('copy-dockerfiles', () => {
  return gulp.src(['./src/spec/**/*.sh', './src/spec/**/!(*.ts)'])
    .pipe(gulp.dest('./dist/src/spec'));
});

gulp.task('test', () => {
  const terminalReporter = new TerminalReporter({ isVerbose: true, showColors: true, includeStackTrace: false });

  return gulp.src('./dist/src/spec/*.js')
    .pipe($.jasmine({
      config: { spec_dir: 'spec', helpers: ['./helpers/**/*.js'] },
      reporter: [terminalReporter]
    }))
    .on('error', swallowError)
    .on('end', addSpaces);
});

gulp.task('lint', () => {
  return gulp.src('./src/**/*.ts')
    .pipe($.tslint())
    .pipe($.tslint.report({ emitError: false }));
});

gulp.task('watch', () => {
  (gulp as any).watch('./src/**/*.ts').on('change', tsLintFile);
  (gulp as any).watch('./src/**/*.ts').on('change', compileFile);
  (gulp as any).watch('./dist/src/spec/**/*.js').on('change', runTestFile);
});

gulp.task('build', (gulp as any).series('clean', 'compile', 'copy-dockerfiles'));

gulp.task('default', (gulp as any).series('build', 'test', 'lint'));

function tsLintFile(file) {
  console.log(colors.yellow('[gulp watch - tsLint]' + ' ' + colors.cyan(file)));
  gulp.src(file)
    .pipe($.tslint())
    .pipe($.tslint.report({ emitError: false }));
}

function compileFile(file: string) {
  console.log(colors.yellow('[gulp watch - compileFile]' + ' ' + colors.cyan(file)));
  const tsProject = $.typescript.createProject('./tsconfig.json', {
    noResolve: false,
    removeComments: true,
    rootDir: path.join(__dirname)
  });

  const tsResult = gulp.src([file, typesPath])
    .pipe(tsProject());

  const sections = file.split('\\');
  sections.pop();
  const dest = sections.join('\\');

  return tsResult.js
    .pipe(gulp.dest(path.join(__dirname, 'dist', dest)));
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
  for (let i = 0; i < 5; i++) {
    console.log('');
  }
}
