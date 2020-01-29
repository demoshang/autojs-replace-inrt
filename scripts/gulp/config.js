const distBasePath = './dist/';

const config = {
  clean: {
    src: [`${distBasePath}**/*`],
    options: {
      force: true,
    },
  },
  server: {
    src: ['**/*', '!**/*.d.ts'],
    opt: {
      cwd: 'src/',
      base: 'src/',
    },
    dest: distBasePath,
  },
  replace: {
    src: [],
    regexp: '',
    newSubstr: '',
  },
  cp: {
    src: ['package.json'],
    opt: {
      cwd: './',
      base: './',
    },
    dest: distBasePath,
  },
  nodemon: {
    config: {
      script: 'index.ts',
      ext: 'ts',
      watch: ['src/'],
      verbose: true,
      restartable: 'rs',
      env: {
        NODE_ENV: 'development',
        TS_NODE_FILES: true,
      },
      exec: `node ${
        process.env.INSPECT ? [`--inspect=${process.env.INSPECT}`] : ''
      } --require=ts-node/register`,
    },
    events: {
      crash: true,
      start: false,
      quit: true,
    },
  },
};

module.exports = config;
