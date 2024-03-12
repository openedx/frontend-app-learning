const path = require('path');
const { createConfig } = require('@edx/frontend-build');

const config = createConfig('webpack-dev');

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
  '@plugins': path.resolve(__dirname, 'plugins'),
  '@plugin-framework': path.resolve(__dirname, 'plugin-framework'),
};

module.exports = config;
