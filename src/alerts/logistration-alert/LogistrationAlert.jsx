import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { Alert, Hyperlink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';

import genericMessages from '../../generic/messages';

function LogistrationAlert({ intl }) {
  const signIn = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getLoginRedirectUrl(global.location.href)}`}
    >
      {intl.formatMessage(genericMessages.signInLowercase)}
    </Hyperlink>
  );

  // TODO: Pull this registration URL building out into a function, like the login one above.
  // This is complicated by the fact that we don't have a REGISTER_URL env variable available.
  const register = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={`${getConfig().LMS_BASE_URL}/register?next=${encodeURIComponent(global.location.href)}`}
    >
      {intl.formatMessage(genericMessages.registerLowercase)}
    </Hyperlink>
  );

  return (
    <Alert variant="warning" icon={WarningFilled}>
      <FormattedMessage
        id="learning.logistration.alert"
        description="Prompts the user to sign in or register to see course content."
        defaultMessage="To see course content, {signIn} or {register}."
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
