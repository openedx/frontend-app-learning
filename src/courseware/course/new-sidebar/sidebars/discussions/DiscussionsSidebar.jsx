import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import React, { useContext } from 'react';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import messages from './messages';
import { SidebarID } from '../../constants';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);

const DiscussionsSidebar = ({ intl }) => {
  const {
    unitId,
    courseId,
    hideDiscussionbar,
    isDiscussionbarAvailable,
  } = useContext(SidebarContext);
  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}/category/${unitId}`;

  if (hideDiscussionbar || !isDiscussionbarAvailable) { return null; }

  return (
    <SidebarBase
      title={intl.formatMessage(messages.discussionsTitle)}
      ariaLabel={intl.formatMessage(messages.discussionsTitle)}
      sidebarId={SidebarID}
      showTitleBar={false}
      allowFullHeight
      className="flex-fill"
    >
      <iframe
        src={`${discussionsUrl}?inContextSidebar`}
        className="d-flex w-100 h-100 border-0 flex-fill"
        title={intl.formatMessage(messages.discussionsTitle)}
        allow="clipboard-write"
        loading="lazy"
      />
    </SidebarBase>
  );
};

DiscussionsSidebar.propTypes = {
  intl: intlShape.isRequired,
};

DiscussionsSidebar.Trigger = DiscussionsSidebar;

export default injectIntl(DiscussionsSidebar);
