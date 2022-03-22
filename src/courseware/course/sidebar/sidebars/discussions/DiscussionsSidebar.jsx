import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import React, { useContext } from 'react';
import { useModel } from '../../../../../generic/model-store';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import { ID } from './DiscussionsTrigger';

import messages from './messages';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);

function DiscussionsSidebar({ intl }) {
  const {
    unitId,
    courseId,
  } = useContext(SidebarContext);
  const topic = useModel('discussionTopics', unitId);
  if (!topic?.id) {
    return null;
  }
  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}/topics/${topic.id}`;
  return (
    <SidebarBase
      title={intl.formatMessage(messages.discussionsTitle)}
      ariaLabel={intl.formatMessage(messages.discussionsTitle)}
      sidebarId={ID}
      width="50rem"
      showTitleBar={false}
    >
      <iframe
        src={`${discussionsUrl}?inContext`}
        className="d-flex w-100 border-0"
        style={{ minHeight: '60rem' }}
        title={intl.formatMessage(messages.discussionsTitle)}
      />
    </SidebarBase>
  );
}

DiscussionsSidebar.propTypes = {
  intl: intlShape.isRequired,
};

DiscussionsSidebar.Trigger = DiscussionsSidebar;
DiscussionsSidebar.ID = ID;

export default injectIntl(DiscussionsSidebar);
