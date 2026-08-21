import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@openedx/paragon';
import { Compass } from '@openedx/paragon/icons';

import { useModel } from '../../generic/model-store';
import { useTourData } from '../data/apiHooks';
import { useTourState } from '../TourContext';
import messages from '../messages';

const LaunchCourseHomeTourButton = ({ srOnly }) => {
  const intl = useIntl();
  const { courseId } = useParams();

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

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

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {toursEnabled && (
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
      )}
    </>
  );
};

LaunchCourseHomeTourButton.defaultProps = {
  srOnly: false,
};

LaunchCourseHomeTourButton.propTypes = {
  srOnly: PropTypes.bool,
};

export default LaunchCourseHomeTourButton;
