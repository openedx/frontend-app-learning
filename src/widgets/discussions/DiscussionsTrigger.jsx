import { ensureConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { QuestionAnswer } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useDiscussionTopic } from '@src/courseware/data/apiHooks';
import { WIDGETS } from '@src/constants';
import SidebarTriggerBase from '@src/courseware/course/sidebar/common/TriggerBase';
import { useSidebar } from '@src/courseware/course/sidebar/SidebarContext';
import messages from './messages';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);
export const ID = WIDGETS.DISCUSSIONS;

const DiscussionsTrigger = ({
  onClick,
}) => {
  const intl = useIntl();
  const { courseId, unitId } = useSidebar();
  const topic = useDiscussionTopic(courseId, unitId).data;

  if (!topic?.id || !topic?.enabledInContext) {
    return null;
  }

  return (
    <SidebarTriggerBase onClick={onClick} ariaLabel={intl.formatMessage(messages.openDiscussionsTrigger)}>
      <Icon src={QuestionAnswer} className="m-0 m-auto" />
    </SidebarTriggerBase>
  );
};

DiscussionsTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DiscussionsTrigger;
