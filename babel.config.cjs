module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
        esmodules: true
      },
      modules: 'auto',
      useBuiltIns: 'usage',
      corejs: '3.36',
      shippedProposals: true
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: '@emotion/react'
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
      useESModules: true,
      corejs: 3
    }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-modules-commonjs'
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs'
        }]
      ],
      plugins: [
        'babel-plugin-dynamic-import-node',
        'babel-plugin-transform-import-meta',
        ['@babel/plugin-transform-runtime', {
          useESModules: false,
          corejs: 3
        }]
      ]
    }
  },
  sourceType: 'unambiguous'
};
