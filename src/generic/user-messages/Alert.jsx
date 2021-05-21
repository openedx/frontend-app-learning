import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  faExclamationTriangle, faInfoCircle, faCheckCircle, faMinusCircle, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { ALERT_TYPES } from './UserMessagesProvider';
import './Alert.scss';
import messages from '../messages';

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

function getAlertIconColor(type) {
  if (type === ALERT_TYPES.SUCCESS) {
    return 'text-success-500';
  }
  return '';
}

function Alert({
  type, dismissible, children, footer, intl, onDismiss,
}) {
  return (
    <div data-testid={`alert-container-${type}`} className={classNames('alert', { 'alert-dismissible': dismissible }, getAlertClass(type))} style={{ padding: '1em' }}>
      <div className="row w-100 m-0">
        {type !== ALERT_TYPES.WELCOME && (
          <div className="col-auto p-0 mr-3">
            <FontAwesomeIcon icon={getAlertIcon(type)} className={getAlertIconColor(type)} />
          </div>
        )}
        <div className="col mr-4 p-0 align-items-start">
          <div role="alert" className="flex-grow-1">
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="col-auto p-0" style={{ margin: '-0.2em -0.2em 0em 0em' }}>
            <IconButton
              icon={faTimes}
              onClick={onDismiss}
              alt={intl.formatMessage(messages.close)}
              variant="primary"
            />
          </div>
        )}
      </div>
      {footer}
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
  footer: PropTypes.node,
  intl: intlShape.isRequired,
  onDismiss: PropTypes.func,
};

Alert.defaultProps = {
  dismissible: false,
  children: undefined,
  footer: null,
  onDismiss: null,
};

export default injectIntl(Alert);
