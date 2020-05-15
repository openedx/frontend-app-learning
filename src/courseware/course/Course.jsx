import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { AlertList } from '../../user-messages';
import { useAccessExpirationAlert } from '../../access-expiration-alert';
import { useLogistrationAlert } from '../../logistration-alert';
import { useEnrollmentAlert } from '../../enrollment-alert';
import { useOfferAlert } from '../../offer-alert';
import PageLoading from '../../PageLoading';

import InstructorToolbar from './InstructorToolbar';
import Sequence from './sequence';

import CourseBreadcrumbs from './CourseBreadcrumbs';
import { Header, CourseTabsNavigation } from '../../course-header';
import CourseSock from './course-sock';
import ContentTools from './tools/ContentTools';
import messages from './messages';
import { useModel } from '../../model-store';

// Note that we import from the component files themselves in the enrollment-alert package.
// This is because Reacy.lazy() requires that we import() from a file with a Component as it's
// default export.
// See React.lazy docs here: https://reactjs.org/docs/code-splitting.html#reactlazy
const AccessExpirationAlert = React.lazy(() => import('../../access-expiration-alert/AccessExpirationAlert'));
const EnrollmentAlert = React.lazy(() => import('../../enrollment-alert/EnrollmentAlert'));
const StaffEnrollmentAlert = React.lazy(() => import('../../enrollment-alert/StaffEnrollmentAlert'));
const LogistrationAlert = React.lazy(() => import('../../logistration-alert'));
const OfferAlert = React.lazy(() => import('../../offer-alert/OfferAlert'));

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

  useOfferAlert(courseId);
  useLogistrationAlert();
  useEnrollmentAlert(courseId);
  useAccessExpirationAlert(courseId);

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
      canShowUpgradeSock,
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
            courseId={courseId}
            unitId={unitId}
          />
        )}
        <CourseTabsNavigation tabs={tabs} activeTabSlug="courseware" />
        <div className="container-fluid">
          <AlertList
            className="my-3"
            topic="course"
            customAlerts={{
              clientEnrollmentAlert: EnrollmentAlert,
              clientStaffEnrollmentAlert: StaffEnrollmentAlert,
              clientLogistrationAlert: LogistrationAlert,
              clientAccessExpirationAlert: AccessExpirationAlert,
              clientOfferAlert: OfferAlert,
            }}
            // courseId is provided because EnrollmentAlert and StaffEnrollmentAlert require it.
            customProps={{
              courseId,
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
            courseId={courseId}
            unitNavigationHandler={unitNavigationHandler}
            nextSequenceHandler={nextSequenceHandler}
            previousSequenceHandler={previousSequenceHandler}
          />
          {canShowUpgradeSock && verifiedMode && <CourseSock verifiedMode={verifiedMode} />}
          <ContentTools course={course} />
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
