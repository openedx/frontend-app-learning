const path = require('path');
const { createConfig } = require('@openedx/frontend-build');
const sass = require('sass');

const config = createConfig('webpack-dev');

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
};

// Fix for react-focus-on webpack 5 compatibility issue
// The package has ES modules without file extensions in imports
config.module.rules.push({
  test: /\.m?js$/,
  resolve: {
    fullySpecified: false,
  },
});

// Fix for sass-loader deprecation warnings
config.module.rules.forEach((rule) => {
  if (rule.oneOf) {
    rule.oneOf.forEach((oneOfRule) => {
      if (oneOfRule.use) {
        oneOfRule.use.forEach((loaderConfig) => {
          if (loaderConfig.loader && loaderConfig.loader.includes('sass-loader')) {
            // eslint-disable-next-line no-param-reassign
            loaderConfig.options = {
              ...loaderConfig.options,
              api: 'modern',
              implementation: sass,
              sassOptions: {
                ...loaderConfig.options?.sassOptions,
                silenceDeprecations: [
                  'import',
                  'abs-percent',
                  'color-functions',
                  'global-builtin',
                  'legacy-js-api',
                ],
              },
            };
          }
        });
      }
    });
  }
});

module.exports = config;
