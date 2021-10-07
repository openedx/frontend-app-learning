import React from 'react';
import { useSelector } from 'react-redux';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import { useModel } from '../../generic/model-store';

import messages from './messages';

function ProgressHeader({ intl }) {
  const {
    courseId,
    targetUserId,
  } = useSelector(state => state.courseHome);

  const { administrator, userId } = getAuthenticatedUser();

  const { studioUrl, username } = useModel('progress', courseId);

  const viewingOtherStudentsProgressPage = (targetUserId && targetUserId !== userId);

  const pageTitle = viewingOtherStudentsProgressPage
    ? intl.formatMessage(messages.progressHeaderForTargetUser, { username })
    : intl.formatMessage(messages.progressHeader);

  return (
    <>
      <div className="row w-100 m-0 mt-3 mb-4 justify-content-between">
        <h1>{pageTitle}</h1>
        {administrator && studioUrl && (
          <Button variant="outline-primary" size="sm" className="align-self-center" href={studioUrl}>
            {intl.formatMessage(messages.studioLink)}
          </Button>
        )}
      </div>
    </>
  );
}

ProgressHeader.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ProgressHeader);
