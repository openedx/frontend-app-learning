import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { useSelector } from 'react-redux';

import { useScrollToContent } from '@src/generic/hooks';
import { MAIN_CONTENT_ID } from '@src/constants';
import { useModel } from '../../generic/model-store';

import messages from './messages';

const ProgressHeader = () => {
  const intl = useIntl();
  const {
    courseId,
    targetUserId,
  } = useSelector(state => state.courseHome);

  const { administrator, userId } = getAuthenticatedUser();

  const { studioUrl, username } = useModel('progress', courseId);

  useScrollToContent(MAIN_CONTENT_ID);

  const viewingOtherStudentsProgressPage = (targetUserId && targetUserId !== userId);

  const pageTitle = viewingOtherStudentsProgressPage
    ? intl.formatMessage(messages.progressHeaderForTargetUser, { username })
    : intl.formatMessage(messages.progressHeader);

  return (
    <div className="row w-100 m-0 mt-3 mb-4 justify-content-between">
      <h1 id={MAIN_CONTENT_ID} tabIndex="-1">{pageTitle}</h1>
      {administrator && studioUrl && (
      <Button variant="outline-primary" size="sm" className="align-self-center" href={studioUrl}>
        {intl.formatMessage(messages.studioLink)}
      </Button>
      )}
    </div>
  );
};

export default ProgressHeader;
