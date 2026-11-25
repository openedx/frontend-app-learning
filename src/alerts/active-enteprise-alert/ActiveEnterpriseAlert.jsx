import React from 'react';
import {
  FormattedMessage, getSiteConfig, resolveRouteByRole, useIntl,
} from '@openedx/frontend-base';
import PropTypes from 'prop-types';
import { Alert, Hyperlink } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';

import { courseOutlineRole } from '@src/constants';
import genericMessages from './messages';

const ActiveEnterpriseAlert = ({ payload }) => {
  const intl = useIntl();
  const { text, courseId } = payload;
  // The outline is Learning's own route; an absolute URL, since the LMS sends the learner back to it.
  const courseHomeUrl = new URL(resolveRouteByRole(courseOutlineRole, { courseId }).url, global.location.origin).href;
  const changeActiveEnterprise = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={
        `${getSiteConfig().lmsBaseUrl}/enterprise/select/active/?success_url=${encodeURIComponent(courseHomeUrl)}`
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
};

ActiveEnterpriseAlert.propTypes = {
  payload: PropTypes.shape({
    text: PropTypes.string,
    courseId: PropTypes.string,
  }).isRequired,
};

export default ActiveEnterpriseAlert;
