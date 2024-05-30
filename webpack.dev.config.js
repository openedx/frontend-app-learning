const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev');

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
};

// Fix the frontend-build webpack config, which isn't properly serving static asset files in dev mode?!
config.devServer.static = { publicPath: config.output.publicPath };

module.exports = config;
