/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FlyoverTriggerIcon from './FlyoverTriggerIcon';
import { isMobile } from './utils';

const FlyoverTriggerMobile = ({ options }) => {
  const { isVisible, toggle } = options.flyover;
  if (!options.access.isAudit || options.state.afterUpgradeDeadline) {
    return null;
  }
  return (isMobile() && (
    <div
      className={classNames(
        'mmp2p-toggle-flyover-button-mobile',
        { 'flyover-visible': isVisible },
      )}
      aria-hidden="true"
      onClick={toggle}
    >
      <FlyoverTriggerIcon />
    </div>
  ));
};

FlyoverTriggerMobile.propTypes = {
  options: PropTypes.shape({
    access: PropTypes.shape({
      isAudit: PropTypes.bool.isRequired,
    }),
    flyover: PropTypes.shape({
      isVisible: PropTypes.bool.isRequired,
      toggle: PropTypes.func.isRequired,
    }),
    state: PropTypes.shape({
      afterUpgradeDeadline: PropTypes.bool.isRequired,
    }),
  }),
};

FlyoverTriggerMobile.defaultProps = {
  options: {
    access: { isAudit: false },
    flyover: {
      isVisible: true,
      toggle: () => {},
    },
    state: { afterUpgradeDeadline: false },
  },
};

export default FlyoverTriggerMobile;
