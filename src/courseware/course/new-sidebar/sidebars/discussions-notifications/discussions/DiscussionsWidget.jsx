import React, { useContext } from 'react';

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../../../messages';
import SidebarContext from '../../../SidebarContext';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);

const DiscussionsWidget = () => {
  const intl = useIntl();
  const {
    unitId,
    courseId,
    hideDiscussionbar,
    isDiscussionbarAvailable,
  } = useContext(SidebarContext);
  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}/category/${unitId}`;

  if (hideDiscussionbar || !isDiscussionbarAvailable) { return null; }

  return (
    <iframe
      src={`${discussionsUrl}?inContextSidebar`}
      className="d-flex w-100 vh-100 flex-fill border border-light-400 rounded-sm"
      title={intl.formatMessage(messages.discussionsTitle)}
      allow="clipboard-write"
      loading="lazy"
    />
  );
};

export default DiscussionsWidget;
