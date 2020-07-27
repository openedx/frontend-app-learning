import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';

import { Alert } from '../../generic/user-messages';
import messages from './messages';

function LogistrationAlert({ intl }) {
  const signIn = (
    <a href={`${getLoginRedirectUrl(global.location.href)}`}>
      {intl.formatMessage(messages.login)}
    </a>
  );

  // TODO: Pull this registration URL building out into a function, like the login one above.
  // This is complicated by the fact that we don't have a REGISTER_URL env variable available.
  const register = (
    <a href={`${getConfig().LMS_BASE_URL}/register?next=${encodeURIComponent(global.location.href)}`}>
      {intl.formatMessage(messages.register)}
    </a>
  );

  return (
    <Alert type="error">
      <FormattedMessage
        id="learning.logistration.alert"
        description="Prompts the user to sign in or register to see course content."
        defaultMessage="Please {signIn} or {register} to see course content."
        values={{
          signIn,
          register,
        }}
      />
    </Alert>
  );
}

LogistrationAlert.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(LogistrationAlert);
