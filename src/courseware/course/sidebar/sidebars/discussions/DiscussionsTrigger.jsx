import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { QuestionAnswer } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import { useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useModel } from '@src/generic/model-store';
import { WIDGETS } from '@src/constants';
import { getCourseDiscussionTopics } from '../../../../data/thunks';
import SidebarTriggerBase from '../../common/TriggerBase';
import SidebarContext from '../../SidebarContext';
import messages from './messages';

ensureConfig(['DISCUSSIONS_MFE_BASE_URL']);
export const ID = WIDGETS.DISCUSSIONS;

const DiscussionsTrigger = ({
  intl,
  onClick,
}) => {
  const {
    unitId,
    courseId,
  } = useContext(SidebarContext);
  const dispatch = useDispatch();
  const { tabs } = useModel('courseHomeMeta', courseId);
  const topic = useModel('discussionTopics', unitId);
  const baseUrl = getConfig().DISCUSSIONS_MFE_BASE_URL;
  const edxProvider = useMemo(
    () => tabs?.find(tab => tab.slug === 'discussion'),
    [tabs],
  );

  useEffect(() => {
    if (baseUrl && edxProvider) {
      dispatch(getCourseDiscussionTopics(courseId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, baseUrl]);

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
  intl: intlShape.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default injectIntl(DiscussionsTrigger);
