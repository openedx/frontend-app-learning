import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { QuestionAnswer } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModel } from '../../../../../generic/model-store';
import { getCourseDiscussionTopics } from '../../../../data/thunks';
import SidebarTriggerBase from '../../common/TriggerBase';
import SidebarContext from '../../SidebarContext';
import messages from './messages';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);
export const ID = 'DISCUSSIONS';

function DiscussionsTrigger({
  intl,
  onClick,
}) {
  const {
    unitId,
    courseId,
  } = useContext(SidebarContext);
  const dispatch = useDispatch();
  const topic = useModel('discussionTopics', unitId);
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;

  useEffect(() => {
    // Only fetch the topic data if the MFE is configured.
    if (baseUrl) {
      dispatch(getCourseDiscussionTopics(courseId));
    }
  }, [courseId, baseUrl]);
  if (!topic.id) {
    return null;
  }
  return (
    <SidebarTriggerBase onClick={onClick} ariaLabel={intl.formatMessage(messages.openDiscussionsTrigger)}>
      <Icon src={QuestionAnswer} className="m-0 m-auto" />
    </SidebarTriggerBase>
  );
}

DiscussionsTrigger.propTypes = {
  intl: intlShape.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default injectIntl(DiscussionsTrigger);
