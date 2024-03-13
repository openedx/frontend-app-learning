import React, {
  useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import classNames from 'classnames';

import {
  PLUGIN_MOUNTED,
  PLUGIN_READY,
  PLUGIN_RESIZE,
} from './data/constants';
import {
  dispatchPluginEvent,
  useElementSize,
  usePluginEvent,
} from './data/hooks';
import { iframePluginConfigShape } from './data/shapes';

/**
 * Feature policy for iframe, allowing access to certain courseware-related media.
 *
 * We must use the wildcard (*) origin for each feature, as courseware content
 * may be embedded in external iframes. Notably, xblock-lti-consumer is a popular
 * block that iframes external course content.

 * This policy was selected in conference with the edX Security Working Group.
 * Changes to it should be vetted by them (security@edx.org).
 */
export const IFRAME_FEATURE_POLICY = (
  'fullscreen; microphone *; camera *; midi *; geolocation *; encrypted-media *'
);

function PluginContainerIframe({
  config, loadingFallback, className, ...props
}) {
  const { url, title } = config;
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  const [iframeRef, iframeElement, width, height] = useElementSize();

  useEffect(() => {
    if (mounted) {
      dispatchPluginEvent(iframeElement, {
        type: PLUGIN_RESIZE,
        payload: {
          width,
          height,
        },
      }, url);
    }
  }, [iframeElement, mounted, width, height, url]);

  usePluginEvent(iframeElement, PLUGIN_MOUNTED, () => {
    setMounted(true);
  });

  usePluginEvent(iframeElement, PLUGIN_READY, () => {
    setReady(true);
  });

  return (
    <>
      <iframe
        ref={iframeRef}
        title={title}
        src={url}
        allow={IFRAME_FEATURE_POLICY}
        referrerPolicy="origin" // The sent referrer will be limited to the origin of the referring page: its scheme, host, and port.
        className={classNames(
          'border border-0 w-100',
          { 'd-none': !ready },
          className,
        )}
        {...props}
      />
      {!ready && loadingFallback}
    </>
  );
}

export default PluginContainerIframe;

PluginContainerIframe.propTypes = {
  /** Configuration for the Plugin in this container (i.e. pluginSlot[id].example_plugin) */
  config: PropTypes.shape(iframePluginConfigShape),
  /** Custom fallback component used when component is not ready (i.e. "loading") */
  loadingFallback: PropTypes.node,
  /** Classes to apply to the iframe */
  className: PropTypes.string,
};

PluginContainerIframe.defaultProps = {
  config: null,
  loadingFallback: null,
  className: null,
};
