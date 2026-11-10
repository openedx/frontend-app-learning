import React from 'react';
import {
  getAppConfig, getAuthenticatedUser, getLinkProps, getUrlByRouteRole, useIntl,
} from '@openedx/frontend-base';
import { Hyperlink } from '@openedx/paragon';

import { appId, dashboardRole, profileRole } from '@src/constants';
import messages from '../courseware/course/course-exit/messages';

const DashboardLink = () => {
  const intl = useIntl();
  const dashboardUrl = getUrlByRouteRole(dashboardRole);
  if (!dashboardUrl) {
    return null;
  }
  return (
    <Hyperlink
      variant="muted"
      isInline
      {...getLinkProps(dashboardUrl)}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );
};

const IdVerificationSupportLink = () => {
  const intl = useIntl();
  if (!getAppConfig(appId).SUPPORT_URL_ID_VERIFICATION) {
    return null;
  }
  return (
    <Hyperlink
      variant="muted"
      isInline
      destination={getAppConfig(appId).SUPPORT_URL_ID_VERIFICATION}
    >
      {intl.formatMessage(messages.idVerificationSupportLink)}
    </Hyperlink>
  );
};

const ProfileLink = () => {
  const intl = useIntl();
  const { username } = getAuthenticatedUser();
  const profileUrl = getUrlByRouteRole(profileRole);
  if (!profileUrl) {
    return null;
  }
  // A username param on the profile role would replace this append, but external routes ignore params: https://github.com/openedx/frontend-base/issues/349
  const userProfileUrl = `${profileUrl.replace(/\/$/, '')}/u/${username}`;

  return (
    <Hyperlink
      variant="muted"
      isInline
      {...getLinkProps(userProfileUrl)}
    >
      {intl.formatMessage(messages.profileLink)}
    </Hyperlink>
  );
};

export { DashboardLink, IdVerificationSupportLink, ProfileLink };
