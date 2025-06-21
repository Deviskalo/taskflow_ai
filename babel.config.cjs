module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      modules: 'commonjs',
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-modules-commonjs', {
      loose: true,
    }],
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      useESModules: false,
    }],
    ['babel-plugin-transform-import-meta', {
      module: 'ES6',
    }],
  ],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-runtime',
        ['babel-plugin-transform-import-meta', {
          module: 'ES6',
        }],
      ],
    },
  },
};
