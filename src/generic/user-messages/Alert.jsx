import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  faExclamationTriangle, faInfoCircle, faCheckCircle, faMinusCircle, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@edx/paragon';

import { ALERT_TYPES } from './UserMessagesProvider';
import './Alert.scss';

function getAlertClass(type) {
  if (type === ALERT_TYPES.ERROR) {
    return 'alert-warning';
  }
  if (type === ALERT_TYPES.DANGER) {
    return 'alert-danger';
  }
  if (type === ALERT_TYPES.SUCCESS) {
    return 'alert-success';
  }
  if (type === ALERT_TYPES.WELCOME) {
    return 'alert-welcome alert-light';
  }
  return 'alert-info';
}

function getAlertIcon(type) {
  if (type === ALERT_TYPES.ERROR) {
    return faExclamationTriangle;
  }
  if (type === ALERT_TYPES.DANGER) {
    return faMinusCircle;
  }
  if (type === ALERT_TYPES.SUCCESS) {
    return faCheckCircle;
  }
  return faInfoCircle;
}

function Alert({
  type, dismissible, children, onDismiss,
}) {
  return (
    <div className={classNames('alert', { 'alert-dismissible': dismissible }, getAlertClass(type))}>
      <div className="d-flex align-items-start">
        {type !== ALERT_TYPES.WELCOME && (
          <div className="mr-2">
            <FontAwesomeIcon icon={getAlertIcon(type)} />
          </div>
        )}
        <div role="alert" className="flex-grow-1">
          {children}
        </div>
      </div>
      {dismissible && <Button className="close" onClick={onDismiss}><FontAwesomeIcon size="sm" icon={faTimes} /></Button>}
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf([
    ALERT_TYPES.ERROR,
    ALERT_TYPES.DANGER,
    ALERT_TYPES.INFO,
    ALERT_TYPES.SUCCESS,
    ALERT_TYPES.WELCOME,
  ]).isRequired,
  dismissible: PropTypes.bool,
  children: PropTypes.node,
  onDismiss: PropTypes.func,
};

Alert.defaultProps = {
  dismissible: false,
  children: undefined,
  onDismiss: null,
};

export default Alert;
