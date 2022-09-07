import React from 'react';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import { Alert, Hyperlink } from '@edx/paragon';
import { WarningFilled } from '@edx/paragon/icons';

import { getConfig } from '@edx/frontend-platform';
import genericMessages from './messages';

function ActiveEnterpriseAlert({ intl, payload }) {
  const { text, courseId } = payload;
  const changeActiveEnterprise = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={
        `${getConfig().LMS_BASE_URL}/enterprise/select/active/?success_url=${encodeURIComponent(
          `${global.location.origin}/course/${courseId}/home`,
        )}`
    }
    >
      {intl.formatMessage(genericMessages.changeActiveEnterpriseLowercase)}
    </Hyperlink>
  );

  return (
    <Alert variant="warning" icon={WarningFilled}>
      {text}
      <FormattedMessage
        id="learning.activeEnterprise.alert"
        description="Prompts the user to log-in with the correct enterprise to access the course content."
        defaultMessage=" {changeActiveEnterprise}."
        values={{
          changeActiveEnterprise,
        }}
      />
    </Alert>
  );
}

ActiveEnterpriseAlert.propTypes = {
  intl: intlShape.isRequired,
  payload: PropTypes.shape({
    text: PropTypes.string,
    courseId: PropTypes.string,
  }).isRequired,
};

export default injectIntl(ActiveEnterpriseAlert);
