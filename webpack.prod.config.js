const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('webpack-prod');

// Filter plugins in the preset config that we don't want
function filterPlugins(plugins) {
  const pluginsToRemove = [
    'a', // "a" is the constructor name of HtmlWebpackNewRelicPlugin
  ];
  return plugins.filter(plugin => {
    const pluginName = plugin.constructor && plugin.constructor.name;
    return !pluginsToRemove.includes(pluginName);
  });
}

config.plugins = filterPlugins(config.plugins);

module.exports = config;
