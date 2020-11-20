import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { AlertList } from '../../generic/user-messages';
import useAccessExpirationAlert from '../../alerts/access-expiration-alert';
import useOfferAlert from '../../alerts/offer-alert';

import Sequence from './sequence';

import { FirstSectionCelebrationModal, shouldCelebrateOnSectionLoad } from './celebration';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import CourseSock from './course-sock';
import ContentTools from './content-tools';
import { useModel } from '../../generic/model-store';

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

  const {
    canShowUpgradeSock,
    celebrations,
    courseExpiredMessage,
    offerHtml,
    verifiedMode,
  } = course;

  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const offerAlert = useOfferAlert(offerHtml, 'course');
  const accessExpirationAlert = useAccessExpirationAlert(courseExpiredMessage, 'course');

  const dispatch = useDispatch();
  const celebrateFirstSection = celebrations && celebrations.firstSection;
  const celebrationOpen = shouldCelebrateOnSectionLoad(courseId, sequenceId, unitId, celebrateFirstSection, dispatch);

  return (
    <>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <AlertList
        className="my-3"
        topic="course"
        customAlerts={{
          ...accessExpirationAlert,
          ...offerAlert,
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
        <FirstSectionCelebrationModal
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
