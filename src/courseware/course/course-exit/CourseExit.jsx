import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import CourseCelebration from './CourseCelebration';
import CourseInProgress from './CourseInProgress';
import CourseNonPassing from './CourseNonPassing';
import { COURSE_EXIT_MODES, getCourseExitMode } from './utils';
import messages from './messages';

function CourseExit({ intl }) {
  const { courseId } = useSelector(state => state.courseware);
  const mode = getCourseExitMode(courseId);

  let body = null;
  if (mode === COURSE_EXIT_MODES.nonPassing) {
    body = (<CourseNonPassing />);
  } else if (mode === COURSE_EXIT_MODES.inProgress) {
    body = (<CourseInProgress />);
  } else if (mode === COURSE_EXIT_MODES.celebration) {
    body = (<CourseCelebration />);
  } else {
    return (<Redirect to={`/course/${courseId}`} />);
  }

  return (
    <>
      <div className="row w-100 mt-2 mb-4 justify-content-end">
        <Button
          variant="outline-primary"
          href={`${getConfig().LMS_BASE_URL}/dashboard`}
        >
          {intl.formatMessage(messages.viewCoursesButton)}
        </Button>
      </div>
      {body}
    </>
  );
}

CourseExit.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseExit);
