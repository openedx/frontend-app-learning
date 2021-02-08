import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// This component shows an effort estimate provided by the backend block data. Either time, activities, or both.
// Right now it is an experiment, and AA-659 is its cleanup ticket.

function EffortEstimate(props) {
  const {
    block: {
      effortActivities,
      effortTime,
    },
    className,
  } = props;

  // FIXME: This is not properly internationalized. This is just an experiment right now, so I chose to not mark
  // FIXME: the strings for translation. That should be fixed if/when this is made real code. AA-659
  const minuteCount = Math.ceil(effortTime / 60); // effortTime is in seconds
  const minutes = (
    <>
      {minuteCount}
      <span aria-hidden="true"> min</span>
      <span className="sr-only"> {minuteCount === 1 ? 'minute' : 'minutes'}</span>
    </>
  );
  const activities = <>{effortActivities} {effortActivities === 1 ? 'activity' : 'activities'}</>;
  let content = null;

  if (effortTime && effortActivities) {
    content = <>{minutes} + {activities}</>;
  } else if (effortTime) {
    content = <>{minutes}</>;
  } else if (effortActivities) {
    content = <>{activities}</>;
  } else {
    return null;
  }

  return (
    <span
      className={classNames('text-gray-500 text-monospace', className)}
      style={{ fontSize: '0.8em' }}
    >
      {content}
    </span>
  );
}

EffortEstimate.defaultProps = {
  className: null,
};

EffortEstimate.propTypes = {
  block: PropTypes.shape({
    effortActivities: PropTypes.number,
    effortTime: PropTypes.number,
  }).isRequired,
  className: PropTypes.string,
};

export default EffortEstimate;
