import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import genericMessages from '../generic/messages';

function AnonymousUserMenu({ intl }) {
  return (
    <div>
      <Button
        className="mr-3"
        variant="outline-primary"
        href={`${getConfig().LMS_BASE_URL}/register?next=${encodeURIComponent(global.location.href)}`}
      >
        {intl.formatMessage(genericMessages.registerSentenceCase)}
      </Button>
      <Button
        variant="primary"
        href={`${getLoginRedirectUrl(global.location.href)}`}
      >
        {intl.formatMessage(genericMessages.signInSentenceCase)}
      </Button>
    </div>
  );
}

AnonymousUserMenu.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AnonymousUserMenu);
