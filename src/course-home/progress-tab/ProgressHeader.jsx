import { getAuthenticatedUser, useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';

import { useTargetUserId } from '@src/generic/course-params';

import { useProgressData } from './hooks';
import messages from './messages';

const ProgressHeader = () => {
  const intl = useIntl();
  const targetUserIdParam = useTargetUserId();
  const targetUserId = parseInt(targetUserIdParam, 10);

  const { administrator, userId } = getAuthenticatedUser();

  const { studioUrl, username } = useProgressData();

  const viewingOtherStudentsProgressPage = (targetUserId && targetUserId !== userId);

  const pageTitle = viewingOtherStudentsProgressPage
    ? intl.formatMessage(messages.progressHeaderForTargetUser, { username })
    : intl.formatMessage(messages.progressHeader);

  return (
    <div className="row w-100 m-0 mt-3 mb-4 justify-content-between">
      <h1>{pageTitle}</h1>
      {administrator && studioUrl && (
        <Button variant="outline-primary" size="sm" className="align-self-center" href={studioUrl}>
          {intl.formatMessage(messages.studioLink)}
        </Button>
      )}
    </div>
  );
};

export default ProgressHeader;
