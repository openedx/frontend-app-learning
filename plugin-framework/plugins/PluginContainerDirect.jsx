import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { directPluginConfigShape } from './data/shapes';

const PluginContainerDirect = ({ config, loadingFallback, ...props }) => {
  const {
    RenderWidget, id, content,
  } = config;

  return (
    <Suspense fallback={loadingFallback}>
      <RenderWidget id={id} content={content} {...props} />
    </Suspense>
  );
};

PluginContainerDirect.propTypes = {
  /** Configuration for the Plugin in this container (i.e. pluginSlot[id].example_plugin) */
  config: PropTypes.shape(directPluginConfigShape),
  /** Custom fallback component used when component is not ready (i.e. "loading") */
  loadingFallback: PropTypes.node,
};

PluginContainerDirect.defaultProps = {
  config: null,
  loadingFallback: null,
};

export default PluginContainerDirect;
