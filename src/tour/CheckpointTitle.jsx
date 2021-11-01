import React from 'react';
import PropTypes from 'prop-types';

export default function CheckpointTitle({ children }) {
  return (
    <h2 id="checkpoint-title" className="h3 mb-0 mr-2.5">
      {children}
    </h2>
  );
}

CheckpointTitle.defaultProps = {
  children: null,
};

CheckpointTitle.propTypes = {
  children: PropTypes.node,
};
