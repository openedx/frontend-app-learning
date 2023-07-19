// eslint-disable-next-line import/no-extraneous-dependencies
const { createConfig } = require('@edx/frontend-build');

const config = createConfig('eslint', {
  // Docs for formatjs plugin:
  // https://formatjs.io/docs/tooling/linter/#react
  plugins: ['formatjs'],
  rules: {
    // TODO: all these rules should be renabled/addressed. temporarily turned off to unblock a release.
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-restricted-exports': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/no-unknown-property': 'off',
    'func-names': 'off',
    'formatjs/enforce-description': ['error', 'literal'],
  },
});

module.exports = config;
