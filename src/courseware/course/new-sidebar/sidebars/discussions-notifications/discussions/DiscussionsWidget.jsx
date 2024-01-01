import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import React, { useContext } from 'react';
import SidebarContext from '../../../SidebarContext';
import messages from '../../../messages';

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
      className="d-flex w-100 h-100 border-0 flex-fill"
      title={intl.formatMessage(messages.discussionsTitle)}
      allow="clipboard-write"
      loading="lazy"
    />
  );
};

export default DiscussionsWidget;
