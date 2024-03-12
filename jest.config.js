const { createConfig } = require('@edx/frontend-build');

const config = createConfig('jest', {
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
    "^axios$": "axios/dist/axios.js",
    // See https://stackoverflow.com/questions/72382316/jest-encountered-an-unexpected-token-react-markdown
    'react-markdown': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    '@src/(.*)': '<rootDir>/src/$1',
    '@plugins/(.*)': '<rootDir>/plugins/$1',
    '@plugin-framework': '<rootDir>/plugin-framework/index.js',
  },
  testTimeout: 30000,
  globalSetup: "./global-setup.js",
  verbose: true,
  testEnvironment: 'jsdom',
});

// delete config.testURL;

config.reporters = [...(config.reporters || []), ["jest-console-group-reporter", {
  // change this setting if need to see less details for each test
  // reportType: "summary" | "details", 
  // enable: true | false,
  afterEachTest: {
    enable: true,
    filePaths: false,
    reportType: "details",
  },
  afterAllTests: {
    reportType: "summary",
    enable: true,
    filePaths: true,
  },
}]];

module.exports = config;
