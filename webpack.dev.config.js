const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev');

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
  '@edx/learning-mfe-widget': path.resolve(__dirname, 'src/sidebar-widget-sdk.js'),
};

module.exports = config;
