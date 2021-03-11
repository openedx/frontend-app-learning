/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import Sidecard from './Sidecard';

export const FlyoverMobile = ({ options }) => {
  const {
    access: { isAudit },
    flyover: { toggle },
    state: { afterUpgradeDeadline },
  } = options;

  const handleReturnSpanKeyPress = (event) => {
    if (event.key === 'Enter') {
      toggle();
    }
  };

  if (!isAudit || afterUpgradeDeadline) {
    return null;
  }

  return (
    <div className="mmp2p-flyover-mobile">
      <div className="mmp2p-mobile-return-div">
        <span
          className="mmp2p-mobile-return-span"
          onClick={toggle}
          onKeyPress={handleReturnSpanKeyPress}
          role="button"
          tabIndex={0}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className="mr-2 fa-lg"
            style={{ marginBottom: 2 }}
          />
          <span className="mmp2p-mobile-return-text">
            Back to course
          </span>
        </span>
      </div>
      <div className="mmp2p-notification-div">
        <span className="mmp2p-notification-span">
          Notifications
        </span>
        <div className="mmp2p-notification-block">
          <Sidecard options={options} />
        </div>
      </div>
    </div>
  );
};
FlyoverMobile.propTypes = {
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

FlyoverMobile.defaultProps = {
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

export default FlyoverMobile;
