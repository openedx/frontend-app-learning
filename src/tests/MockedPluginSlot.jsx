import React from 'react';
import PropTypes from 'prop-types';

const MockedPluginSlot = ({ children, id }) => (
  <div data-testid={id}>
    PluginSlot_{id}
    { children && <div>{children}</div> }
  </div>
);

MockedPluginSlot.displayName = 'PluginSlot';

MockedPluginSlot.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  id: PropTypes.string,
};

MockedPluginSlot.defaultProps = {
  children: undefined,
  id: undefined,
};

export default MockedPluginSlot;
