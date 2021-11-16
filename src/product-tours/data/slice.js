/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'tours',
  initialState: {
    showCoursewareTour: false,
    showExistingUserCourseHomeTour: false,
    showNewUserCourseHomeModal: false,
    showNewUserCourseHomeTour: false,
    toursEnabled: false,
  },
  reducers: {
    disableCourseHomeTour: (state) => {
      state.showNewUserCourseHomeModal = false;
      state.showNewUserCourseHomeTour = false;
      state.showExistingUserCourseHomeTour = false;
    },
    disableCoursewareTour: (state) => {
      state.showCoursewareTour = false;
    },
    disableNewUserCourseHomeModal: (state) => {
      state.showNewUserCourseHomeModal = false;
    },
    launchCourseHomeTour: (state) => {
      if (state.showExistingUserCourseHomeTour) {
        state.showExistingUserCourseHomeTour = false;
      }

      if (!state.showNewUserCourseHomeModal || !state.showNewUserCourseHomeTour) {
        state.showNewUserCourseHomeTour = true;
      }
    },
    setTourData: (state, { payload }) => {
      const {
        courseHomeTourStatus,
        showCoursewareTour,
        toursEnabled,
      } = payload;
      state.showCoursewareTour = showCoursewareTour;
      state.showExistingUserCourseHomeTour = courseHomeTourStatus === 'show-existing-user-tour';
      state.showNewUserCourseHomeModal = courseHomeTourStatus === 'show-new-user-tour';
      state.toursEnabled = toursEnabled;
    },
  },
});

export const {
  disableCourseHomeTour,
  disableCoursewareTour,
  disableNewUserCourseHomeModal,
  launchCourseHomeTour,
  setTourData,
} = slice.actions;

export const {
  reducer,
} = slice;
