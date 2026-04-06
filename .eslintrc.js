// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('eslint', {
  rules: {
    // TODO: all these rules should be renabled/addressed. temporarily turned off to unblock a release.
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-restricted-exports': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/no-unknown-property': 'off',
    'func-names': 'off',
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.prod.config.js',
      },
    },
  },
});

module.exports = config;
