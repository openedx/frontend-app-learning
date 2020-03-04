import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Alert from '../user-messages/Alert';
import messages from './messages';

function EnrollmentAlert({ intl }) {
  return (
    <Alert type="error">
      {intl.formatMessage(messages['learning.enrollment.alert'])}
      {' '}
      <a href={`${getConfig().LMS_BASE_URL}/api/enrollment/v1/enrollment`}>
        {intl.formatMessage(messages['learning.enrollment.enroll.now'])}
      </a>
    </Alert>
  );
}

EnrollmentAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(EnrollmentAlert);
