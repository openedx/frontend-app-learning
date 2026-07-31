/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { ProductTour } from '@openedx/paragon';

import abandonTour from './AbandonTour';
import coursewareTour from './CoursewareTour';
import existingUserCourseHomeTour from './ExistingUserCourseHomeTour';
import newUserCourseHomeTour from './newUserCourseHomeTour/NewUserCourseHomeTour';
import NewUserCourseHomeTourModal from './newUserCourseHomeTour/NewUserCourseHomeTourModal';
import { useEndCourseHomeTour, useEndCoursewareTour, useTourData } from './data/apiHooks';
import { useTourState } from './TourContext';

const ProductTours = ({
  activeTab,
  courseId,
  isStreakCelebrationOpen,
  org,
}) => {
  const {
    proctoringPanelStatus,
  } = useSelector(state => state.courseHome);

  const {
    showCoursewareTour,
    showExistingUserCourseHomeTour,
    showNewUserCourseHomeModal,
    showNewUserCourseHomeTour,
    setTourData,
    disableCourseHomeTour,
    disableCoursewareTour,
    closeNewUserCourseHomeModal,
  } = useTourState();

  const [isAbandonTourEnabled, setIsAbandonTourEnabled] = useState(false);
  const [isCoursewareTourEnabled, setIsCoursewareTourEnabled] = useState(false);
  const [isExistingUserCourseHomeTourEnabled, setIsExistingUserCourseHomeTourEnabled] = useState(false);
  const [isNewUserCourseHomeTourEnabled, setIsNewUserCourseHomeTourEnabled] = useState(false);

  const {
    administrator,
    username,
  } = getAuthenticatedUser() || {};
  const coursewareTabActive = activeTab === 'courseware';
  const outlineTabActive = activeTab === 'outline';

  const endCoursewareTourMutation = useEndCoursewareTour();
  const endCourseHomeTourMutation = useEndCourseHomeTour();

  // Persist the tour completion and hide it client-side (mirrors the former end-tour thunks).
  const endCoursewareTour = () => {
    endCoursewareTourMutation.mutate(username);
    disableCoursewareTour();
  };
  const endCourseHomeTour = () => {
    endCourseHomeTourMutation.mutate(username);
    disableCourseHomeTour();
  };

  const shouldFetchTourData = () => {
    // The tour endpoint is per-user; there's nothing to fetch for anonymous users.
    if (!username) {
      return false;
    }

    // Tours only exist on the Outline and Courseware tabs, so avoid calling the
    // tour endpoint on any other tab.
    if (!coursewareTabActive && !outlineTabActive) {
      return false;
    }

    // On the outline tab the tour anchors to the weekly-goal widget, which only
    // renders once the proctoring panel has loaded; wait for it so the tour's
    // target elements exist before we start.
    if (outlineTabActive && proctoringPanelStatus !== 'loaded') {
      return false;
    }

    return true;
  };

  const { data: tourData } = useTourData(username, shouldFetchTourData());

  useEffect(() => {
    if (tourData) {
      setTourData(tourData);
    }
  }, [tourData]);

  useEffect(() => {
    if (coursewareTabActive && showCoursewareTour) {
      setIsCoursewareTourEnabled(true);
    }
  }, [showCoursewareTour]);

  useEffect(() => {
    if (outlineTabActive) {
      setIsExistingUserCourseHomeTourEnabled(!!showExistingUserCourseHomeTour);
    }
  }, [showExistingUserCourseHomeTour]);

  useEffect(() => {
    if (outlineTabActive && showNewUserCourseHomeTour) {
      setIsAbandonTourEnabled(false);
      setIsNewUserCourseHomeTourEnabled(true);
    }
  }, [showNewUserCourseHomeTour]);

  if (isStreakCelebrationOpen) {
    return null;
  }

  // The <ProductTour /> component cannot handle rendering multiple enabled tours at once.
  // I.e. when adding new tours, beware that if multiple tours are enabled,
  // the first enabled tour in the following array will be the only one that renders.
  // The suggestion for populating these tour objects is to ensure only one tour is enabled at a time.
  const tours = [
    abandonTour({
      enabled: isAbandonTourEnabled,
      onEnd: () => setIsAbandonTourEnabled(false),
    }),
    coursewareTour({
      enabled: isCoursewareTourEnabled,
      onEnd: () => {
        setIsCoursewareTourEnabled(false);
        sendTrackEvent('edx.ui.lms.courseware_tour.completed', {
          org_key: org,
          courserun_key: courseId,
          is_staff: administrator,
        });
        endCoursewareTour();
      },
    }),
    existingUserCourseHomeTour({
      enabled: isExistingUserCourseHomeTourEnabled,
      onEnd: () => {
        setIsExistingUserCourseHomeTourEnabled(false);
        sendTrackEvent('edx.ui.lms.existing_user_tour.completed', {
          org_key: org,
          courserun_key: courseId,
          is_staff: administrator,
        });
        endCourseHomeTour();
      },
    }),
    newUserCourseHomeTour({
      enabled: isNewUserCourseHomeTourEnabled,
      onDismiss: () => {
        setIsNewUserCourseHomeTourEnabled(false);
        setIsAbandonTourEnabled(true);
        sendTrackEvent('edx.ui.lms.new_user_tour.dismissed', {
          org_key: org,
          courserun_key: courseId,
          is_staff: administrator,
        });
        endCourseHomeTour();
        endCoursewareTour();
      },
      onEnd: () => {
        setIsNewUserCourseHomeTourEnabled(false);
        sendTrackEvent('edx.ui.lms.new_user_tour.completed', {
          org_key: org,
          courserun_key: courseId,
          is_staff: administrator,
        });
        endCourseHomeTour();
      },
    }),
  ];

  return (
    <>
      <ProductTour
        tours={tours}
      />
      <NewUserCourseHomeTourModal
        isOpen={outlineTabActive && showNewUserCourseHomeModal}
        onDismiss={() => {
          sendTrackEvent('edx.ui.lms.new_user_modal.dismissed', {
            org_key: org,
            courserun_key: courseId,
            is_staff: administrator,
          });
          closeNewUserCourseHomeModal();
          setIsAbandonTourEnabled(true);
          endCourseHomeTour();
        }}
        onStartTour={() => {
          sendTrackEvent('edx.ui.lms.new_user_tour.started', {
            org_key: org,
            courserun_key: courseId,
            is_staff: administrator,
          });
          closeNewUserCourseHomeModal();
          setIsNewUserCourseHomeTourEnabled(true);
        }}
      />
    </>
  );
};

ProductTours.propTypes = {
  activeTab: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
  isStreakCelebrationOpen: PropTypes.bool.isRequired,
  org: PropTypes.string.isRequired,
};

export default ProductTours;
