import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Badge({ children, className }) {
  return (
    <span className={classNames('dates-badge badge align-text-bottom font-italic ml-2 px-2 py-1', className)}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Badge.defaultProps = {
  children: null,
  className: null,
};
