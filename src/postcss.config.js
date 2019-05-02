/* I'm here to allow autoprefixing in webpack.prod.config.js */
module.exports = {
  plugins: [
    /* eslint-disable-next-line global-require, import/no-extraneous-dependencies */
    require('autoprefixer')({ grid: true, browsers: ['>1%'] }),
  ],
};

