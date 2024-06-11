import { useContext } from 'react';
import classNames from 'classnames';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useModel } from '@src/generic/model-store';
import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import { ID } from './DiscussionsTrigger';

import messages from './messages';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);

const DiscussionsSidebar = ({ intl }) => {
  const {
    unitId,
    courseId,
    shouldDisplayFullScreen,
  } = useContext(SidebarContext);
  const topic = useModel('discussionTopics', unitId);
  const discussionsUrl = `${getConfig().DISCUSSIONS_MFE_BASE_URL}/${courseId}/category/${unitId}`;

  if (!topic?.id || !topic?.enabledInContext) {
    return null;
  }

  return (
    <SidebarBase
      title={intl.formatMessage(messages.discussionsTitle)}
      ariaLabel={intl.formatMessage(messages.discussionsTitle)}
      sidebarId={ID}
      width="45rem"
      showTitleBar={false}
      className={classNames({
        'ml-4': !shouldDisplayFullScreen,
      })}
    >
      <iframe
        src={`${discussionsUrl}?inContextSidebar`}
        className="d-flex sticky-top vh-100 w-100 border-0 discussions-sidebar-frame"
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
DiscussionsSidebar.ID = ID;

export default injectIntl(DiscussionsSidebar);
