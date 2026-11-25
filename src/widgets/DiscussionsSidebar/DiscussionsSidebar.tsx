import classNames from 'classnames';
import { useIntl } from '@openedx/frontend-base';

import SidebarBase from '@src/courseware/course/sidebar/common/SidebarBase';
import { useSidebar } from '@src/courseware/course/sidebar/SidebarContext';
import { useDiscussionTopic } from '@src/courseware/data/apiHooks';

import { discussionsSidebarWidgetId } from './constants';
import messages from './messages';
import type { DiscussionsWidgetProps } from './types';
import { getDiscussionsSidebarUrl } from './urls';

const DiscussionsSidebar = ({ courseId, unitId }: DiscussionsWidgetProps) => {
  const intl = useIntl();
  const { shouldDisplayFullScreen } = useSidebar();
  const topic = useDiscussionTopic(courseId, unitId ?? '').data;
  const discussionsUrl = unitId ? getDiscussionsSidebarUrl(courseId, unitId) : null;

  if (!discussionsUrl || !topic?.id || !topic?.enabledInContext) {
    return null;
  }

  return (
    <SidebarBase
      title={intl.formatMessage(messages.discussionsTitle)}
      ariaLabel={intl.formatMessage(messages.discussionsTitle)}
      sidebarId={discussionsSidebarWidgetId}
      width="45rem"
      showTitleBar={false}
      className={classNames({
        'ml-4': !shouldDisplayFullScreen,
      })}
    >
      <iframe
        src={discussionsUrl}
        className="d-flex sticky-top vh-100 w-100 border-0 discussions-sidebar-frame"
        title={intl.formatMessage(messages.discussionsTitle)}
        allow="clipboard-write"
        loading="lazy"
      />
    </SidebarBase>
  );
};

export default DiscussionsSidebar;
