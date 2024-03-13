'use client';

import React, {
  useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { ErrorBoundary } from '@edx/frontend-platform/react';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  dispatchMountedEvent, dispatchReadyEvent, dispatchUnmountedEvent, useHostEvent,
} from './data/hooks';
import { PLUGIN_RESIZE } from './data/constants';
import messages from './Plugin.messages';

// TODO: create example-plugin-app/src/PluginOne.jsx for example of customizing errorFallback as part of APER-3042 https://2u-internal.atlassian.net/browse/APER-3042
function ErrorFallbackDefault() {
  const { formatMessage } = useIntl();
  return (
    <div>
      <h2>
        {formatMessage(messages.unexpectedError)}
      </h2>
    </div>
  );
}

function Plugin({
  children, className, style, ready, ErrorFallbackComponent,
}) {
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });

  const finalStyle = useMemo(() => ({
    ...dimensions,
    ...style,
  }), [dimensions, style]);

  // Need to confirm: When an error is caught here, the logging will be sent to the child MFE's logging service

  const ErrorFallback = ErrorFallbackComponent || ErrorFallbackDefault;

  useHostEvent(PLUGIN_RESIZE, ({ payload }) => {
    setDimensions({
      width: payload.width,
      height: payload.height,
    });
  });

  useEffect(() => {
    dispatchMountedEvent();

    return () => {
      dispatchUnmountedEvent();
    };
  }, []);

  useEffect(() => {
    /** Ready defaults to true, but can be used to defer rendering the Plugin until certain processes have
     * occurred or conditions have been met */
    if (ready) {
      dispatchReadyEvent();
    }
  }, [ready]);

  return (
    <div className={className} style={finalStyle}>
      <ErrorBoundary
        fallbackComponent={<ErrorFallback />}
      >
        {children}
      </ErrorBoundary>
    </div>
  );
}

export default Plugin;

Plugin.propTypes = {
  /** The content for the Plugin */
  children: PropTypes.node.isRequired,
  /** Classes to apply to the Plugin wrapper component */
  className: PropTypes.string,
  /** Custom error fallback component */
  ErrorFallbackComponent: PropTypes.func,
  /** If ready is true, it will render the Plugin */
  ready: PropTypes.bool,
  /** Styles to apply to the Plugin wrapper component */
  style: PropTypes.shape({}),
};

Plugin.defaultProps = {
  className: null,
  ErrorFallbackComponent: null,
  style: {},
  ready: true,
};
