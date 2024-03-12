import React, { forwardRef } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import classNames from 'classnames';
import { Spinner } from '@edx/paragon';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './Plugin.messages';
import { usePluginSlot } from './data/hooks';
import PluginContainer from './PluginContainer';
import { organizePlugins, wrapComponent } from './data/utils';

const PluginSlot = forwardRef(({
  as, id, pluginProps, ...props
}, ref) => {
  /** the plugins below are obtained by the id passed into PluginSlot by the Host MFE. See example/src/PluginsPage.jsx
  for an example of how PluginSlot is populated, and example/src/index.jsx for a dummy JS config that holds all plugins
  */
  const { plugins, defaultContents } = usePluginSlot(id);
  const { formatMessage } = useIntl();

  const finalPlugins = React.useMemo(() => organizePlugins(defaultContents, plugins), [defaultContents, plugins]);

  // TODO: APER-3178 — Unique plugin props
  // https://2u-internal.atlassian.net/browse/APER-3178
  const { loadingFallback } = pluginProps;

  const defaultLoadingFallback = (
    <div className={classNames(pluginProps.className, 'd-flex justify-content-center align-items-center')}>
      <Spinner animation="border" screenReaderText={formatMessage(messages.loading)} />
    </div>
  );

  const finalLoadingFallback = loadingFallback !== undefined
    ? loadingFallback
    : defaultLoadingFallback;

  const finalChildren = [];
  if (finalPlugins.length > 0) {
    finalPlugins.forEach((pluginConfig) => {
      // If hidden, don't push to finalChildren
      if (!pluginConfig.hidden) {
        const newContainer = (
          <PluginContainer
            key={pluginConfig.id}
            config={pluginConfig}
            loadingFallback={finalLoadingFallback}
            {...pluginProps}
          />
        );
        // If wrappers are provided, wrap the Plugin
        if (pluginConfig.wrappers) {
          finalChildren.push(
            wrapComponent(
              () => newContainer,
              pluginConfig.wrappers,
            ),
          );
        } else {
          finalChildren.push(newContainer);
        }
      }
    });
  }

  return React.createElement(
    as,
    {
      ...props,
      ref,
    },
    finalChildren,
  );
});

export default PluginSlot;

PluginSlot.propTypes = {
  /** Element type for the PluginSlot wrapper component */
  as: PropTypes.elementType,
  /** ID of the PluginSlot configuration */
  id: PropTypes.string.isRequired,
  /** Props that are passed down to each Plugin in the Slot */
  pluginProps: PropTypes.object, // eslint-disable-line
};

PluginSlot.defaultProps = {
  as: 'div',
  pluginProps: {},
};
