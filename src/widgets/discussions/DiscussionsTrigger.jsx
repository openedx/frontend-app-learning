import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { QuestionAnswer } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useModel } from '@src/generic/model-store';
import { WIDGETS } from '@src/constants';
import SidebarTriggerBase from '@src/courseware/course/sidebar/common/TriggerBase';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import messages from './messages';

export const ID = WIDGETS.DISCUSSIONS;

const DiscussionsTrigger = ({
  onClick,
}) => {
  const intl = useIntl();
  const {
    unitId,
  } = useContext(SidebarContext);
  const topic = useModel('discussionTopics', unitId);

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
