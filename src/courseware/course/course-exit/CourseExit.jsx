import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Redirect, useParams } from 'react-router-dom';

import CourseCelebration from './CourseCelebration';
import messages from './messages';
import { useModel } from '../../../generic/model-store';

// These are taken from the edx-platform `get_cert_data` function found in lms/courseware/views/views.py
const CELEBRATION_STATUSES = [
  'downloadable',
  'earned_but_not_available',
  'requesting',
  'unverified',
];

function CourseExit({ intl }) {
  const { courseId } = useParams();
  const {
    courseExitPageIsActive,
    userHasPassingGrade,
    certificateData,
  } = useModel('courses', courseId);

  // userHasPassingGrade can be removed once there is an experience for failing learners
  if (!courseExitPageIsActive || !userHasPassingGrade) {
    return (<Redirect to={`/course/${courseId}`} />);
  }

  const {
    certStatus,
  } = certificateData;

  if (CELEBRATION_STATUSES.indexOf(certStatus) !== -1) {
    return (
      <>
        <div className="row w-100 m-0 justify-content-end">
          <Button
            variant="outline-primary"
            href={`${getConfig().LMS_BASE_URL}/dashboard`}
          >
            {intl.formatMessage(messages.viewCoursesButton)}
          </Button>
        </div>
        <CourseCelebration />
      </>
    );
  }
  // Just to be safe
  return (<Redirect to={`/course/${courseId}`} />);
}

CourseExit.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseExit);
