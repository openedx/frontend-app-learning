import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import AlertList from '../../user-messages/AlertList';
import { useLogistrationAlert } from '../../logistration-alert';
import { useEnrollmentAlert } from '../../enrollment-alert';
import PageLoading from '../../PageLoading';

import InstructorToolbar from './InstructorToolbar';
import Sequence from './sequence';

import CourseBreadcrumbs from './CourseBreadcrumbs';
import { Header, CourseTabsNavigation } from '../../course-header';
import CourseSock from './course-sock';
import messages from './messages';
import { useModel } from '../../model-store';

const EnrollmentAlert = React.lazy(() => import('../../enrollment-alert'));
const LogistrationAlert = React.lazy(() => import('../../logistration-alert'));

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
  intl,
}) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);
  const unit = useModel('units', unitId);

  useLogistrationAlert();
  useEnrollmentAlert(courseId);

  const courseStatus = useSelector(state => state.courseware.courseStatus);

  if (courseStatus === 'loading') {
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages['learn.loading.learning.sequence'])}
      />
    );
  }

  if (courseStatus === 'loaded') {
    const {
      org, number, title, isStaff, tabs, verifiedMode,
    } = course;
    return (
      <>
        <Header
          courseOrg={org}
          courseNumber={number}
          courseTitle={title}
        />
        {isStaff && (
        <InstructorToolbar
          unitId={unit.id}
        />
        )}
        <CourseTabsNavigation tabs={tabs} activeTabSlug="courseware" />
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
            courseId={courseId}
            sectionId={section ? section.id : null}
            sequenceId={sequenceId}
          />
          <AlertList topic="sequence" />
        </div>
        <div className="flex-grow-1 d-flex flex-column">
          <Sequence
            unitId={unitId}
            sequenceId={sequenceId}
            courseUsageKey={courseId}
            unitNavigationHandler={unitNavigationHandler}
            nextSequenceHandler={nextSequenceHandler}
            previousSequenceHandler={previousSequenceHandler}
          />
          {verifiedMode && <CourseSock verifiedMode={verifiedMode} />}
        </div>
      </>
    );
  }

  // courseStatus 'failed' and any other unexpected course status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages['learn.course.load.failure'])}
    </p>
  );
}

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

export default injectIntl(Course);
