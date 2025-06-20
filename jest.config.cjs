/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@testing-library/jest-dom/extend-expect': 
      '<rootDir>/node_modules/@testing-library/jest-dom/extend-expect.js',
    '^src/(.*)\.(js|jsx|ts|tsx|mjs)$': '<rootDir>/src/$1',
    '^@/lib/supabase$': '<rootDir>/src/lib/__mocks__/supabase.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(js|jsx|mjs|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: 'auto',
              targets: { node: 'current' },
            },
          ],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
        plugins: [
          ['@babel/plugin-transform-modules-commonjs'],
          ['@babel/plugin-proposal-class-properties'],
          [
            '@babel/plugin-transform-runtime',
            {
              useESModules: false,
              helpers: true,
              regenerator: true,
            },
          ],
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(node-fetch|fetch-blob|@supabase/supabase-js|@babel/runtime/helpers/esm)/)',
    '^.+\\.mjs$',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'json', 'node'],
  testRunner: 'jest-jasmine2',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
};

export default config;
