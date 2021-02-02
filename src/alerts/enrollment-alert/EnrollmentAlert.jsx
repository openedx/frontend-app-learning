import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useModel } from '../../generic/model-store';
import { Alert, ALERT_TYPES } from '../../generic/user-messages';

import messages from './messages';
import { useEnrollClickHandler } from './hooks';

function EnrollmentAlert({ intl, payload }) {
  const {
    canEnroll,
    courseId,
    extraText,
    isStaff,
  } = payload;

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const { enrollClickHandler, loading } = useEnrollClickHandler(
    courseId,
    org,
    intl.formatMessage(messages.success),
  );

  let text = intl.formatMessage(messages.alert);
  let type = ALERT_TYPES.ERROR;
  if (isStaff) {
    text = intl.formatMessage(messages.staffAlert);
    type = ALERT_TYPES.INFO;
  } else if (extraText) {
    text = `${text} ${extraText}`;
  }

  const button = canEnroll && (
    <Button disabled={loading} variant="link" className="p-0 border-0 align-top" style={{ textDecoration: 'underline' }} onClick={enrollClickHandler}>
      {intl.formatMessage(messages.enrollNowSentence)}
    </Button>
  );

  return (
    <Alert type={type}>
      {text}
      {' '}
      {button}
      {' '}
      {loading && <FontAwesomeIcon icon={faSpinner} spin />}
    </Alert>
  );
}

EnrollmentAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    canEnroll: PropTypes.bool,
    courseId: PropTypes.string,
    extraText: PropTypes.string,
    isStaff: PropTypes.bool,
  }).isRequired,
};

export default injectIntl(EnrollmentAlert);
