import { useIntl } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import { QuestionAnswer } from '@openedx/paragon/icons';

import SidebarTriggerBase from '@src/courseware/course/sidebar/common/TriggerBase';
import { useDiscussionTopic } from '@src/courseware/data/apiHooks';

import { discussionsSidebarWidgetId } from './constants';
import messages from './messages';
import type { DiscussionsWidgetProps } from './types';

const DiscussionsTrigger = ({ courseId, unitId }: DiscussionsWidgetProps) => {
  const intl = useIntl();
  const topic = useDiscussionTopic(courseId, unitId ?? '').data;

  if (!topic?.id || !topic?.enabledInContext) {
    return null;
  }

  return (
    <SidebarTriggerBase sidebarId={discussionsSidebarWidgetId} ariaLabel={intl.formatMessage(messages.openDiscussionsTrigger)}>
      <Icon src={QuestionAnswer} className="m-0 m-auto" />
    </SidebarTriggerBase>
  );
};

export default DiscussionsTrigger;
