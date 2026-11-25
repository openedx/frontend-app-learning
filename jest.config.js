const { createConfig } = require('@openedx/frontend-base/tools');

module.exports = createConfig('test', {
  testEnvironment: '<rootDir>/jsdom-environment-with-node-fetch.mjs',
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/__mocks__',
    'src/tests',
  ],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    // The library's `exports` has only an `import` condition, which Jest's resolver does not match.
    '^@edx/frontend-lib-special-exams$': '<rootDir>/node_modules/@edx/frontend-lib-special-exams',
    '\\.svg$': '<rootDir>/src/__mocks__/svg.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/file.js',
  },
});
