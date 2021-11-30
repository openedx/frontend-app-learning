import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { AlertList } from '../../generic/user-messages';

import Sequence from './sequence';

import { CelebrationModal, shouldCelebrateOnSectionLoad } from './celebration';
import ContentTools from './content-tools';
import CourseBreadcrumbs from './CourseBreadcrumbs';
import NotificationTrigger from './NotificationTrigger';

import { useModel } from '../../generic/model-store';
import useWindowSize, { responsiveBreakpoints } from '../../generic/tabs/useWindowSize';
import { getLocalStorage, setLocalStorage } from '../../data/localStorage';

/** [MM-P2P] Experiment */
import { initCoursewareMMP2P, MMP2PBlockModal } from '../../experiments/mm-p2p';

function Course({
  courseId,
  sequenceId,
  unitId,
  nextSequenceHandler,
  previousSequenceHandler,
  unitNavigationHandler,
}) {
  const course = useModel('coursewareMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const section = useModel('sections', sequence ? sequence.sectionId : null);

  const pageTitleBreadCrumbs = [
    sequence,
    section,
    course,
  ].filter(element => element != null).map(element => element.title);

  const {
    celebrations,
    verifiedMode,
  } = course;

  // Below the tabs, above the breadcrumbs alerts (appearing in the order listed here)
  const dispatch = useDispatch();
  const celebrateFirstSection = celebrations && celebrations.firstSection;
  const celebrationOpen = shouldCelebrateOnSectionLoad(
    courseId, sequenceId, unitId, celebrateFirstSection, dispatch, celebrations,
  );

  const shouldDisplayNotificationTrigger = useWindowSize().width >= responsiveBreakpoints.small.minWidth;

  const shouldDisplayNotificationTrayOpen = useWindowSize().width > responsiveBreakpoints.medium.minWidth;

  const [notificationTrayVisible, setNotificationTray] = verifiedMode
    && shouldDisplayNotificationTrayOpen ? useState(true) : useState(false);
  const isNotificationTrayVisible = () => notificationTrayVisible && setNotificationTray;
  const toggleNotificationTray = () => {
    if (notificationTrayVisible) { setNotificationTray(false); } else { setNotificationTray(true); }
  };

  if (!getLocalStorage(`notificationStatus.${courseId}`)) {
    setLocalStorage(`notificationStatus.${courseId}`, 'active'); // Show red dot on notificationTrigger until seen
  }

  if (!getLocalStorage(`upgradeNotificationCurrentState.${courseId}`)) {
    setLocalStorage(`upgradeNotificationCurrentState.${courseId}`, 'initialize');
  }

  const [notificationStatus, setNotificationStatus] = useState(getLocalStorage(`notificationStatus.${courseId}`));
  const [upgradeNotificationCurrentState, setupgradeNotificationCurrentState] = useState(getLocalStorage(`upgradeNotificationCurrentState.${courseId}`));

  const onNotificationSeen = () => {
    setNotificationStatus('inactive');
    setLocalStorage(`notificationStatus.${courseId}`, 'inactive');
  };

  /** [MM-P2P] Experiment */
  const MMP2P = initCoursewareMMP2P(courseId, sequenceId, unitId);

  return (
    <>
      <Helmet>
        <title>{`${pageTitleBreadCrumbs.join(' | ')} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      <div className="position-relative">
        <CourseBreadcrumbs
          courseId={courseId}
          sectionId={section ? section.id : null}
          sequenceId={sequenceId}
          isStaff={course ? course.isStaff : null}
          unitId={unitId}
          //* * [MM-P2P] Experiment */
          mmp2p={MMP2P}
        />

        { shouldDisplayNotificationTrigger ? (
          <NotificationTrigger
            courseId={courseId}
            toggleNotificationTray={toggleNotificationTray}
            isNotificationTrayVisible={isNotificationTrayVisible}
            notificationStatus={notificationStatus}
            setNotificationStatus={setNotificationStatus}
            upgradeNotificationCurrentState={upgradeNotificationCurrentState}
          />
        ) : null}
      </div>

      <AlertList topic="sequence" />
      <Sequence
        unitId={unitId}
        sequenceId={sequenceId}
        courseId={courseId}
        unitNavigationHandler={unitNavigationHandler}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
        toggleNotificationTray={toggleNotificationTray}
        isNotificationTrayVisible={isNotificationTrayVisible}
        notificationTrayVisible={notificationTrayVisible}
        notificationStatus={notificationStatus}
        setNotificationStatus={setNotificationStatus}
        onNotificationSeen={onNotificationSeen}
        upgradeNotificationCurrentState={upgradeNotificationCurrentState}
        setupgradeNotificationCurrentState={setupgradeNotificationCurrentState}
        //* * [MM-P2P] Experiment */
        mmp2p={MMP2P}
      />
      {celebrationOpen && (
        <CelebrationModal
          courseId={courseId}
          open
        />
      )}
      <ContentTools course={course} />
      { /** [MM-P2P] Experiment */ }
      { MMP2P.meta.modalLock && <MMP2PBlockModal options={MMP2P} /> }
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
