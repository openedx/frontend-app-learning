// @ts-check

const { createLintConfig } = require('@openedx/frontend-base/tools');

module.exports = createLintConfig(
  {
    files: [
      'src/**/*',
      'site.config.*',
    ],
  },
  {
    ignores: [
      'coverage/*',
      'dist/*',
      'node_modules/*',
    ],
  },
);
