const { createConfig } = require('@openedx/frontend-base/tools');

module.exports = createConfig('test', {
  testEnvironment: '<rootDir>/jsdom-environment-with-node-fetch.mjs',
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  coverageThreshold: {
    global: {
      lines: 96.15,
    },
  },
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/__mocks__',
    'src/tests',
  ],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '\\.svg$': '<rootDir>/src/__mocks__/svg.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/file.js',
  },
  // lcov paths carry the frontend-base/ prefix so codecov files them under
  // this directory, not over the legacy src/ tree. Jest's defaults, restated.
  coverageReporters: ['clover', 'json', ['lcov', { projectRoot: '..' }], 'text'],
});
