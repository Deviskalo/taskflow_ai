// @ts-check

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@testing-library/jest-dom/extend-expect$': 
      '<rootDir>/node_modules/@testing-library/jest-dom/extend-expect.js',
    '^@sentry/(.*)$': '<rootDir>/node_modules/@sentry/$1',
    '^@supabase/supabase-js$': '<rootDir>/node_modules/@supabase/supabase-js/dist/main/index.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['<rootDir>/src/test/setupEnv.ts'],
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs',
        }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', { loose: true }],
        ['@babel/plugin-transform-runtime', { regenerator: true }],
        ['babel-plugin-transform-import-meta', { module: 'ES6' }],
      ],
    }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$|@?\\w+\\.(?!.*\\.mjs$)|@sentry/.*|@supabase/.*))",
  ],
  testPathIgnorePatterns: ["<rootDir>[/\\\\](node_modules|.next|dist)[/\\\\]"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.spec.json",
    },
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/types.ts",
    "!src/test/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // @ts-ignore
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      babelConfig: {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
        plugins: [
          ["@babel/plugin-transform-modules-commonjs"],
          ["@babel/plugin-transform-class-properties"],
          ["@babel/plugin-transform-runtime"],
        ],
      },
    },
  },
};

module.exports = config;
