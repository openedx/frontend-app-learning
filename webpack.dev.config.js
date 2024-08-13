const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev');

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
};
config.externalsType = 'script';
config.externals = {
  search_library: [
    `${process.env.LMS_BASE_URL}/static/django_search_backend/js/search_library.js`,
    'SearchEngine',
    'SearchEngine',
  ],
};
module.exports = config;
