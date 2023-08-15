const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/.*\\.exp\\..*',
  ],
  // see https://github.com/axios/axios/issues/5026
  moduleNameMapper: {
    "^axios$": "axios/dist/axios.js"
  },
  testTimeout: 30000,
  testEnvironment: 'jsdom'
});
