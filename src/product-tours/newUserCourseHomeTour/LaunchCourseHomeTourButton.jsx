import React from 'react';
import PropTypes from 'prop-types';

import { getAuthenticatedUser, sendTrackEvent, useIntl } from '@openedx/frontend-base';
import { Button, Icon } from '@openedx/paragon';
import { Compass } from '@openedx/paragon/icons';

import { useCourseHomeMeta } from '../../course-home/data/apiHooks';
import { useTourData } from '../data/apiHooks';
import { useTourState } from '../TourContext';
import messages from '../messages';
import { useCourseId } from '@src/generic/course-params';

const LaunchCourseHomeTourButton = ({ srOnly = false }) => {
  const intl = useIntl();
  const courseId = useCourseId();

  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;

  const {
    administrator,
    username,
  } = getAuthenticatedUser() || {};

  const { data: tourData } = useTourData(username, false);
  const toursEnabled = tourData?.toursEnabled;

  const { launchCourseHomeTour } = useTourState();

  const handleClick = () => {
    sendTrackEvent('edx.ui.lms.launch_tour.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      tour_variant: 'course_home',
    });

    launchCourseHomeTour();
  };

  if (!toursEnabled) {
    return null;
  }

  return (
    <Button variant="link" size="inline" className={`p-0 ${srOnly && 'sr-only sr-only-focusable'}`} onClick={handleClick}>
      {!srOnly && (
        <Icon
          src={Compass}
          className="mr-2"
          style={{ height: '18px', width: '18px' }}
        />
      )}
      {intl.formatMessage(messages.launchTour)}
    </Button>
  );
};

LaunchCourseHomeTourButton.propTypes = {
  srOnly: PropTypes.bool,
};

export default LaunchCourseHomeTourButton;
