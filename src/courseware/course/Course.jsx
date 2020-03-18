import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import AlertList from '../../user-messages/AlertList';
import { useLogistrationAlert, useEnrollmentAlert } from '../../hooks';
import PageLoading from '../../PageLoading';

import InstructorToolbar from '../InstructorToolbar';
import Sequence from '../sequence/Sequence';

import CourseBreadcrumbs from './CourseBreadcrumbs';
import CourseHeader from './CourseHeader';
import CourseSock from './course-sock';
import CourseTabsNavigation from './CourseTabsNavigation';
import messages from './messages';
import {
  courseShape, sectionShape, sequenceShape, unitShape, statusShape,
} from './shapes';

const EnrollmentAlert = React.lazy(() => import('../../enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../../logistration-alert'));

function Course({
  course,
  section,
  sequence,
  unit,
  status,
  isFirstUnit,
  isLastUnit,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
  intl,
}) {
  useLogistrationAlert();
  useEnrollmentAlert(course);

  if (status.course === 'loading') {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  if (status.course === 'loaded') {
    return (
      <>
        <CourseHeader
          courseOrg={course.org}
          courseNumber={course.number}
          courseName={course.title}
        />
        {course.isStaff && (
        <InstructorToolbar
          unitId={unit.id}
        />
        )}
        <CourseTabsNavigation tabs={course.tabs} activeTabSlug="courseware" />
        <div className="container-fluid">
          <AlertList
            className="my-3"
            topic="course"
            customAlerts={{
              clientEnrollmentAlert: EnrollmentAlert,
              clientLogistrationAlert: LogistrationAlert,
            }}
          />
          <CourseBreadcrumbs
            status={status}
            course={course}
            section={section}
            sequence={sequence}
          />
          <AlertList topic="sequence" />
        </div>
        <div className="flex-grow-1 d-flex flex-column">
          <Sequence
            unit={unit}
            sequence={sequence}
            status={status}
            courseUsageKey={course.id}
            isFirstUnit={isFirstUnit}
            isLastUnit={isLastUnit}
            unitNavigationHandler={unitNavigationHandler}
            nextSequenceHandler={nextSequenceHandler}
            previousSequenceHandler={previousSequenceHandler}
          />
          {course.verifiedMode && <CourseSock verifiedMode={course.verifiedMode} />}
        </div>
      </>
    );
  }

  // course status 'failed' and any other unexpected course status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages['learn.course.load.failure'])}
    </p>
  );
}

Course.propTypes = {
  status: statusShape.isRequired,
  course: courseShape,
  section: sectionShape,
  sequence: sequenceShape,
  unit: unitShape,
  isFirstUnit: PropTypes.bool.isRequired,
  isLastUnit: PropTypes.bool.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

Course.defaultProps = {
  course: undefined,
  section: undefined,
  sequence: undefined,
  unit: undefined,
};

export default injectIntl(Course);
