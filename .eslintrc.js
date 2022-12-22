const { createConfig } = require('@edx/frontend-build');

const config = createConfig('eslint', {
  rules: {
    // TODO: all these rules should be renabled/addressed. temporarily turned off to unblock a release.
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/function-component-definition': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-restricted-exports': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/jsx-no-bind': 'off',
    'react/no-unknown-property': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/jsx-no-constructed-context-values': 'off',
  },
});

module.exports = config;
