import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Alert } from '../../user-messages';

import messages from './messages';
import { useEnrollClickHandler } from './hooks';

function StaffEnrollmentAlert({ intl, courseId }) {
  const { enrollClickHandler, loading } = useEnrollClickHandler(
    courseId,
    intl.formatMessage(messages['learning.enrollment.success']),
  );

  return (
    <Alert type="info" dismissible>
      {intl.formatMessage(messages['learning.staff.enrollment.alert'])}
      {' '}
      <Button disabled={loading} className="btn-link p-0 border-0 align-top" onClick={enrollClickHandler}>
        {intl.formatMessage(messages['learning.enrollment.enroll.now'])}
      </Button>
      {' '}
      {loading && <FontAwesomeIcon icon={faSpinner} spin />}
    </Alert>
  );
}

StaffEnrollmentAlert.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(StaffEnrollmentAlert);
