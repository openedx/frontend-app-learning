const { createConfig } = require('@edx/frontend-build');
// eslint-disable-next-line import/no-extraneous-dependencies
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = createConfig('webpack-dev', {
  plugins: [
    new ModuleFederationPlugin({
      name: 'learning',
      shared: {
        react: {
          import: 'react', // the "react" package will be used a provided and fallback module
          shareKey: 'react', // under this name the shared module will be placed in the share scope
          shareScope: 'default', // share scope with this name will be used
          singleton: true, // only a single version of the shared module is allowed
          eager: true,
        },
        'react-dom': {
          singleton: true, // only a single version of the shared module is allowed
          eager: true,
        },
        '@edx/frontend-platform': {
          singleton: true,
          eager: true,
        },
        '@edx/frontend-platform/auth': {
          singleton: true,
          eager: true,
        },
      },
    }),
  ],
});
