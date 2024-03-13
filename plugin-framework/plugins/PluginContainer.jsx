'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { logError } from '@edx/frontend-platform/logging';

// eslint-disable-next-line import/no-extraneous-dependencies
import PluginContainerIframe from './PluginContainerIframe';
import PluginContainerDirect from './PluginContainerDirect';

import {
  IFRAME_PLUGIN,
  DIRECT_PLUGIN,
} from './data/constants';
import { pluginConfigShape } from './data/shapes';

function PluginContainer({ config, ...props }) {
  if (config === null) {
    return null;
  }

  // this will allow for future plugin types to be inserted in the PluginErrorBoundary
  let renderer = null;
  switch (config.type) {
    case IFRAME_PLUGIN:
      renderer = (
        <PluginContainerIframe config={config} {...props} />
      );
      break;
    case DIRECT_PLUGIN:
      renderer = (
        <PluginContainerDirect config={config} {...props} />
      );
      break;
    default:
      logError(`Config type ${config.type} is not valid.`);
      break;
  }

  return (
    renderer
  );
}

export default PluginContainer;

PluginContainer.propTypes = {
  /** Configuration for the Plugin in this container — i.e pluginSlot[id].example_plugin */
  config: PropTypes.shape(pluginConfigShape),
};

PluginContainer.defaultProps = {
  config: null,
};
