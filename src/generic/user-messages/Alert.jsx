import React from 'react';
import PropTypes from 'prop-types';
import { Alert as ParagonAlert } from '@edx/paragon';
import { CheckCircle, Info, WarningFilled } from '@edx/paragon/icons';

import { ALERT_TYPES } from './UserMessagesProvider';

function getAlertVariant(type) {
  switch (type) {
    case ALERT_TYPES.ERROR:
      return 'warning';
    case ALERT_TYPES.DANGER:
      return 'danger';
    case ALERT_TYPES.SUCCESS:
      return 'success';
    default:
      return 'info';
  }
}

function getAlertIcon(type) {
  switch (type) {
    case ALERT_TYPES.ERROR:
      return WarningFilled;
    case ALERT_TYPES.SUCCESS:
      return CheckCircle;
    default:
      return Info;
  }
}

function Alert({
  type, dismissible, children, onDismiss, stacked,
}) {
  return (
    <ParagonAlert
      data-testid={`alert-container-${type}`}
      variant={getAlertVariant(type)}
      icon={getAlertIcon(type)}
      dismissible={dismissible}
      onClose={onDismiss}
      stacked={stacked}
    >
      {children}
    </ParagonAlert>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf([
    ALERT_TYPES.ERROR,
    ALERT_TYPES.DANGER,
    ALERT_TYPES.INFO,
    ALERT_TYPES.SUCCESS,
  ]).isRequired,
  dismissible: PropTypes.bool,
  children: PropTypes.node,
  onDismiss: PropTypes.func,
  stacked: PropTypes.bool,
};

Alert.defaultProps = {
  dismissible: false,
  children: undefined,
  onDismiss: null,
  stacked: false,
};

export default Alert;
