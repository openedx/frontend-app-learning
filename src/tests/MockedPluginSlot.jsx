import React from 'react';
import PropTypes from 'prop-types';

const MockedPluginSlot = ({ children, testId }) => {
  if (!testId) { return children ?? 'PluginSlot'; } // Return its content if PluginSlot slot is wrapping any.

  return <div data-testid={testId}>{children}</div>;
};

MockedPluginSlot.displayName = 'PluginSlot';

MockedPluginSlot.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  testId: PropTypes.string,
};

MockedPluginSlot.defaultProps = {
  children: undefined,
  testId: undefined,
};

export default MockedPluginSlot;
