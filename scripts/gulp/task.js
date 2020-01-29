const notifier = require('node-notifier');
const gulp = require('gulp');
const nodemon = require('nodemon');
const gulpLoadPlugins = require('gulp-load-plugins');
const ts = require('gulp-typescript');
const { spawn } = require('child_process');

const tsProject = ts.createProject('tsconfig.json', {
  allowJs: false,
  checkJs: false,
  declaration: false,
  declarationMap: false,
  sourceMap: true,
  rootDir: './',
  outDir: './dist',
  noEmit: false,
});

const utilities = require('./utilities');

const defaultNodemonEvent = {
  crash() {
    console.error('Application has crashed!\n');
    notifier.notify({
      title: 'crashed!',
      message: utilities.formatDate('hh:mm:ss'),
    });
  },
  start() {
    notifier.notify({
      title: 'restarting!',
      message: utilities.formatDate('hh:mm:ss'),
    });
  },
  quit() {
    console.warn('\n===============\nApp has quit\n===============\n');
    process.exit(1);
  },
};

const config = require('./config.js');

const $ = gulpLoadPlugins({
  pattern: ['gulp-*', 'del', 'streamqueue'],
  // ,lazy: false
});

$.gulp = gulp;
$.config = config;

function validConfig(setting, name = 'src') {
  return setting[name] && setting[name].length;
}

gulp.task('clean', () => {
  return $.del(config.clean.src, config.clean.options);
});

gulp.task('eslint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  const f = $.filter(['**/*.ts'], { restore: true });

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe($.cached('eslint'))
    .pipe(f)
    .pipe($.eslint())
    .pipe(
      $.eslint.result((result) => {
        utilities.eslintReporter(result);
      })
    )
    .pipe($.eslint.failOnError())
    .pipe(f.restore)
    .pipe($.remember('eslint'));
});

gulp.task('tsc-lint', () => {
  return ts
    .createProject('tsconfig.json', {
      allowJs: false,
      checkJs: false,
      declaration: false,
      declarationMap: false,
      sourceMap: false,
      noEmit: true,
    })
    .src()
    .pipe(tsProject(ts.reporter.longReporter()));
});

gulp.task('lint', gulp.parallel('eslint', 'tsc-lint'));

gulp.task('tsc', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  const replaceFilter = $.filter(config.replace.src, { restore: true });

  return tsProject
    .src()
    .pipe($.sourcemaps.init())
    .pipe(tsProject(ts.reporter.longReporter()))
    .pipe($.sourcemaps.write('.', { includeContent: false, sourceRoot: '../src' }))
    .pipe(replaceFilter)
    .pipe($.replace(config.replace.regexp, config.replace.newSubstr))
    .pipe(replaceFilter.restore)
    .pipe(gulp.dest(config.server.dest));
});

gulp.task('tscWatch', () => {
  spawn('tsc', ['-w', '--preserveWatchOutput', '--skipLibCheck'], { stdio: 'inherit' });
});

gulp.task('wlint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  // eslint init run
  gulp.series('eslint')();

  // tsc watch
  gulp.series('tscWatch')();

  let timer = null;
  // eslint watch
  gulp.watch(config.server.src, config.server.opt).on('change', (filePath) => {
    clearTimeout(timer);

    timer = setTimeout(async () => {
      try {
        await utilities.spawnDefer({
          cmd: 'clear',
          arg: [],
        });
      } catch (e) {
        console.warn(e);
      }

      if (/models\//.test(filePath)) {
        console.info(`${filePath} do d-ts generate`);

        utilities
          .spawnDefer({
            cmd: 'npm',
            arg: ['run', 'd-ts'],
          })
          .catch((e) => {
            console.warn(e);
          });
      }

      setTimeout(() => {
        console.info(`${filePath} do eslint`);
        gulp.series('eslint')();
      });
    });
  });

  return done();
});

gulp.task('nodemon', (done) => {
  nodemon(config.nodemon.config);

  Object.keys(config.nodemon.events).forEach((eventName) => {
    const event = config.nodemon.events[eventName];
    if (typeof eventName === 'function') {
      nodemon.on(eventName, event);
    } else if (event === true && defaultNodemonEvent[eventName]) {
      nodemon.on(eventName, defaultNodemonEvent[eventName]);
    } else if (typeof event === 'undefined' || event === false) {
      return null;
    } else {
      console.warn(`nodemon event not support for ${eventName}`);
    }
    return null;
  });

  return done();
});

gulp.task('cp', () => {
  return gulp.src(config.cp.src, config.cp.opt).pipe(gulp.dest(config.cp.dest));
});

gulp.task('default', gulp.parallel('nodemon', 'wlint'));

gulp.task('build', gulp.series('clean', gulp.parallel('eslint', 'tsc', 'cp')));
