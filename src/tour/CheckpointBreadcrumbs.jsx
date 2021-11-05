import React from 'react';
import PropTypes from 'prop-types';

export default function CheckpointBreadcrumbs({ currentIndex, totalCheckpoints }) {
  if (totalCheckpoints === 1) {
    return null;
  }
  return (
    <span className="d-flex align-items-center" aria-hidden focusable={false}>
      {new Array(totalCheckpoints).fill(0).map((v, i) => (
        <svg key={Math.random().toString(36).substr(2, 9)} aria-hidden focusable={false} role="img" width="14px" height="14px" viewBox="0 0 14 14">
          {i === currentIndex ? <circle className="checkpoint-popover_breadcrumb checkpoint-popover_breadcrumb_active" cx="7" cy="7" r="3px" />
            : <circle className="checkpoint-popover_breadcrumb checkpoint-popover_breadcrumb_inactive" cx="7" cy="7" r="2.5px" />}
        </svg>
      ))}
    </span>
  );
}

CheckpointBreadcrumbs.defaultProps = {
  currentIndex: null,
  totalCheckpoints: null,
};

CheckpointBreadcrumbs.propTypes = {
  currentIndex: PropTypes.number,
  totalCheckpoints: PropTypes.number,
};
