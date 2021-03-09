/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Sidecard from './Sidecard';

const Flyover = ({
  isStatic,
  options,
}) => {
  const handleHideFlyoverKeyPress = (event) => {
    if (event.key === 'Enter') {
      options.flyover.toggle();
    }
  };
  if (!options.access.isAudit || options.state.afterUpgradeDeadline) {
    return null;
  }
  return (
    <div className={classNames('mmp2p-flyover', { static: isStatic })}>
      { !isStatic && (
        <div className="mmp2p-notification-div">
          <span>Notifications</span>
          <span
            onClick={options.flyover.toggle}
            className="mmp2p-hide-flyover"
            onKeyPress={handleHideFlyoverKeyPress}
            role="button"
            tabIndex={0}
          >
            <svg
              className="mmp2p-flyover-icon"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.60625 7L13.5152 3.09102C13.9949 2.61133 13.9949 1.83359 13.5152 1.35352L12.6465 0.484766C12.1668 0.00507814 11.3891 0.00507814 10.909 0.484766L7 4.39375L3.09102 0.484766C2.61133 0.00507814 1.83359 0.00507814 1.35352 0.484766L0.484766 1.35352C0.00507814 1.8332 0.00507814 2.61094 0.484766 3.09102L4.39375 7L0.484766 10.909C0.00507814 11.3887 0.00507814 12.1664 0.484766 12.6465L1.35352 13.5152C1.8332 13.9949 2.61133 13.9949 3.09102 13.5152L7 9.60625L10.909 13.5152C11.3887 13.9949 12.1668 13.9949 12.6465 13.5152L13.5152 12.6465C13.9949 12.1668 13.9949 11.3891 13.5152 10.909L9.60625 7Z"
                fill="black"
              />
            </svg>
          </span>
          <div className="mmp2p-notification-block" />
        </div>
      )}
      <Sidecard options={options} />
    </div>
  );
};
Flyover.propTypes = {
  isStatic: PropTypes.bool,
  options: PropTypes.shape({
    access: PropTypes.shape({
      isAudit: PropTypes.bool.isRequired,
    }),
    flyover: PropTypes.shape({
      toggle: PropTypes.func.isRequired,
    }),
    state: PropTypes.shape({
      afterUpgradeDeadline: PropTypes.bool.isRequired,
    }),
  }),
};

Flyover.defaultProps = {
  isStatic: false,
  options: {
    access: {
      isAudit: false,
    },
    flyover: {
      toggle: () => {},
    },
    state: {
      afterUpgradeDeadline: false,
    },
  },
};

export default Flyover;
