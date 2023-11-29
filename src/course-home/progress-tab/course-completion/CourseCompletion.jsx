import React from 'react';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import CompletionDonutChart from './CompletionDonutChart';
import messages from './messages';
import headerMessages from '../messages';
import { useModel } from '../../../generic/model-store';

const CourseCompletion = ({ intl }) => {
  const {
    courseId,
    targetUserId,
  } = useSelector(state => state.courseHome);

  const { username } = useModel('progress', courseId);
  const { userId } = getAuthenticatedUser();

  const viewingOtherStudentsProgressPage = (targetUserId && targetUserId !== userId);

  const pageTitle = viewingOtherStudentsProgressPage
    ? intl.formatMessage(headerMessages.progressHeaderForTargetUser, { username })
    : intl.formatMessage(headerMessages.progressHeader);

  return (
    <section className="mb-4 raised-card p-4 px-md-5">
      <div className="row w-100 m-0">
        <div className="col-12 col-sm-6 col-md-7 col-lg-9 p-0">
          <h1 className="h2 mb-4">{pageTitle}</h1>
          <h2 className="h3">{intl.formatMessage(messages.courseCompletion)}</h2>
          <p className="small">
            {intl.formatMessage(messages.completionBody)}
          </p>
        </div>
        <div className="col-12 col-sm-6 col-md-5 col-lg-3 mt-sm-n3 p-0 text-center">
          <CompletionDonutChart />
        </div>
      </div>
    </section>
  );
};

CourseCompletion.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseCompletion);
