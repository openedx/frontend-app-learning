import { logError } from '@edx/frontend-platform/logging';

import { getTourData, patchTourData } from './api';
import {
  disableCourseHomeTour,
  disableCoursewareTour,
  disableNewUserCourseHomeModal,
  setTourData,
} from './slice';

export function closeNewUserCourseHomeModal() {
  return async (dispatch) => dispatch(disableNewUserCourseHomeModal());
}

export function endCourseHomeTour(username) {
  return async (dispatch) => {
    try {
      await patchTourData(username, {
        course_home_tour_status: 'no-tour',
      });
      dispatch(disableCourseHomeTour());
    } catch (error) {
      logError(error);
    }
  };
}

export function endCoursewareTour(username) {
  return async (dispatch) => {
    try {
      await patchTourData(username, {
        show_courseware_tour: false,
      });
      dispatch(disableCoursewareTour());
    } catch (error) {
      logError(error);
    }
  };
}

export function fetchTourData(username) {
  return async (dispatch) => {
    try {
      const data = await getTourData(username);
      dispatch(setTourData(data));
    } catch (error) {
      logError(error);
    }
  };
}
