import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';

import { AlertList } from '../../user-messages';
import { useAccessExpirationAlert } from '../../alerts/access-expiration-alert';
import { useOfferAlert } from '../../alerts/offer-alert';

import Sequence from './sequence';

import { CelebrationModal, shouldCelebrateOnSectionLoad } from './celebration';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import CourseSock from './course-sock';
import ContentTools from './content-tools';
import { useModel } from '../../model-store';

// Note that we import from the component files themselves in the enrollment-alert package.
// This is because Reacy.lazy() requires that we import() from a file with a Component as it's
// default export.
// See React.lazy docs here: https://reactjs.org/docs/code-splitting.html#reactlazy
const AccessExpirationAlert = React.lazy(() => import('../../alerts/access-expiration-alert/AccessExpirationAlert'));
const EnrollmentAlert = React.lazy(() => import('../../alerts/enrollment-alert/EnrollmentAlert'));
const StaffEnrollmentAlert = React.lazy(() => import('../../alerts/enrollment-alert/StaffEnrollmentAlert'));
const LogistrationAlert = React.lazy(() => import('../../alerts/logistration-alert'));
const OfferAlert = React.lazy(() => import('../../alerts/offer-alert/OfferAlert'));

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
}) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);

  useOfferAlert(courseId);
  useAccessExpirationAlert(courseId);

  const {
    canShowUpgradeSock,
    celebrations,
    verifiedMode,
  } = course;

  const celebrateFirstSection = celebrations && celebrations.firstSection;
  const celebrationOpen = shouldCelebrateOnSectionLoad(courseId, sequenceId, unitId, celebrateFirstSection);

  return (
    <>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
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
      <Sequence
        unitId={unitId}
        sequenceId={sequenceId}
        courseId={courseId}
        unitNavigationHandler={unitNavigationHandler}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
      />
      {celebrationOpen && (
        <CelebrationModal
          courseId={courseId}
          open
        />
      )}
      {canShowUpgradeSock && verifiedMode && <CourseSock verifiedMode={verifiedMode} />}
      <ContentTools course={course} />
    </>
  );
}

Course.propTypes = {
  courseId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
};

Course.defaultProps = {
  courseId: null,
  sequenceId: null,
  unitId: null,
};

export default Course;
