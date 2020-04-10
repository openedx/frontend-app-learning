import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import Alert from '../user-messages/Alert';

function AccessExpirationAlert({ intl }) {
  return (
    <Alert type="info">
      <div dangerouslySetInnerHTML={{ __html: courseExpiredMessage }} />
    </Alert>
  );
}

AccessExpirationAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AccessExpirationAlert);
