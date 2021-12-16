import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Icon } from '@edx/paragon';
import { Compass } from '@edx/paragon/icons';

import { useModel } from '../../generic/model-store';
import { launchCourseHomeTour } from '../data/slice';
import messages from '../messages';

function LaunchCourseHomeTourButton({ intl, srOnly }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const {
    toursEnabled,
  } = useSelector(state => state.tours);

  const dispatch = useDispatch();

  const handleClick = () => {
    const { administrator } = getAuthenticatedUser();
    sendTrackEvent('edx.ui.lms.launch_tour.clicked', {
      org_key: org,
      courserun_key: courseId,
      is_staff: administrator,
      tour_variant: 'course_home',
    });

    dispatch(launchCourseHomeTour());
  };

  return (
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
}

LaunchCourseHomeTourButton.defaultProps = {
  srOnly: false,
};

LaunchCourseHomeTourButton.propTypes = {
  intl: intlShape.isRequired,
  srOnly: PropTypes.bool,
};

export default injectIntl(LaunchCourseHomeTourButton);
