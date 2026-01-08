const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

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

module.exports = config;
