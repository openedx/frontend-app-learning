const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    '.*',
    'src/setupTest.js',
    'src/i18n',
    'src/alerts/.*',
    'src/assets/.*',
    'src/course-header/.*',
    'src/courseware/.*',
    'src/data/.*',
    'src/generic/.*',
    'src/i18n/.*',
    'src/index.jsx',
    'src/index.scss',
    'src/instructor-toolbar/.*',
    'src/setupTest.js',
    'src/store.js',
    'src/tab-page/.*',
    'src/toast/.*',
    'src/utils.js',
  ],
});
