const { createConfig } = require('@openedx/frontend-build');

const mergedConfig = createConfig('jest', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/i18n',
    'src/.*\\.exp\\..*',
  ],
  moduleNameMapper: {
    // See https://stackoverflow.com/questions/72382316/jest-encountered-an-unexpected-token-react-markdown
    'react-markdown': '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
    '@src/(.*)': '<rootDir>/src/$1',
    // Explicit mapping to ensure Jest resolves the module correctly
    '@edx/frontend-lib-special-exams': '<rootDir>/node_modules/@edx/frontend-lib-special-exams',
  },
  testTimeout: 30000,
  globalSetup: "./global-setup.js",
  verbose: true,
  testEnvironment: 'jsdom',
});

// delete mergedConfig.testURL;

// NOTE: jest-console-group-reporter@1.1.1 uses @jest/reporters@^30 internally
// (via its peer dep resolution) but this project runs Jest 29, whose globalConfig
// uses testPathPattern (string) not testPathPatterns (object). When any worker
// exits uncleanly the reporter's SummaryReporter.onRunComplete crashes with
// "Cannot read properties of undefined (reading 'isSet')", causing a non-zero
// exit code even when all tests pass. Disabled until the package is updated for
// Jest 29/30 compatibility.
// mergedConfig.reporters = [...(mergedConfig.reporters || []), ["jest-console-group-reporter", {
//   afterEachTest: { enable: true, filePaths: false, reportType: "details" },
//   afterAllTests: { reportType: "summary", enable: true, filePaths: true },
// }]];

// Limit ts-jest diagnostics to test files so type errors in transformed
// dependencies (included via transformIgnorePatterns) don't fail the run.
mergedConfig.transform['^.+\\.[tj]sx?$'] = [
  'ts-jest',
  {
    diagnostics: {
      exclude: ['!**/*.test.*'],
    },
  },
];

module.exports = mergedConfig;
