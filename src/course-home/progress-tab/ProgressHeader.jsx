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
  } = useSelector(state => state.courseHome);

  const { administrator } = getAuthenticatedUser();

  const { studioUrl } = useModel('progress', courseId);

  return (
    <>
      <div className="row w-100 m-0 mb-4 justify-content-between">
        <h1>{intl.formatMessage(messages.progressHeader)}</h1>
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
