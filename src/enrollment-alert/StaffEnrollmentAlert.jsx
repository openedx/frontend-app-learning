import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Alert from '../user-messages/Alert';
import messages from './messages';

function StaffEnrollmentAlert({ intl }) {
  return (
    <Alert type="info" dismissible>
      {intl.formatMessage(messages['learning.staff.enrollment.alert'])}
      {' '}
      <a href={`${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`}>
        {intl.formatMessage(messages['learning.enrollment.enroll.now'])}
      </a>
    </Alert>
  );
}

StaffEnrollmentAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StaffEnrollmentAlert);
