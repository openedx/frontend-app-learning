/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

import {
  LOADING,
  LOADED,
  FAILED,
  DENIED,
} from '@src/constants';

const slice = createSlice({
  name: 'courseware',
  initialState: {
    courseId: null,
    courseStatus: LOADING,
    sequenceId: null,
    sequenceMightBeUnit: false,
    sequenceStatus: LOADING,
    courseOutline: {},
    coursewareOutlineSidebarSettings: {},
    courseOutlineStatus: LOADING,
    courseOutlineShouldUpdate: false,
  },
  reducers: {
    fetchCourseRequest: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADING;
    },
    fetchCourseSuccess: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = LOADED;
    },
    fetchCourseFailure: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = FAILED;
    },
    fetchCourseDenied: (state, { payload }) => {
      state.courseId = payload.courseId;
      state.courseStatus = DENIED;
    },
    fetchSequenceRequest: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = LOADING;
      state.sequenceMightBeUnit = false;
    },
    fetchSequenceSuccess: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = LOADED;
      state.sequenceMightBeUnit = false;
    },
    fetchSequenceFailure: (state, { payload }) => {
      state.sequenceId = payload.sequenceId;
      state.sequenceStatus = FAILED;
      state.sequenceMightBeUnit = payload.sequenceMightBeUnit || false;
    },
    fetchCourseOutlineRequest: (state) => {
      state.courseOutline = {};
      state.courseOutlineStatus = LOADING;
    },
    fetchCourseOutlineSuccess: (state, { payload }) => {
      state.courseOutline = payload.courseOutline;
      state.courseOutlineStatus = LOADED;
      state.courseOutlineShouldUpdate = false;
    },
    fetchCourseOutlineFailure: (state) => {
      state.courseOutline = {};
      state.courseOutlineStatus = FAILED;
    },
    setCoursewareOutlineSidebarToggles: (state, { payload }) => {
      state.coursewareOutlineSidebarSettings = payload;
    },
    updateCourseOutlineCompletion: (state, { payload }) => {
      const { unitId, isComplete: isUnitComplete } = payload;
      if (!isUnitComplete) {
        return state;
      }

      state.courseOutline.units[unitId].complete = true;

      const sequenceId = Object.keys(state.courseOutline.sequences)
        .find(id => state.courseOutline.sequences[id].unitIds.includes(unitId));
      const sequenceUnits = state.courseOutline.sequences[sequenceId].unitIds;
      const completedUnits = sequenceUnits.filter((id) => state.courseOutline.units[id].complete);
      const isAllUnitsAreComplete = sequenceUnits.every((id) => state.courseOutline.units[id].complete);

      // Update amount of completed units of the sequence
      state.courseOutline.sequences[sequenceId].completionStat.completed = completedUnits.length;

      if (isAllUnitsAreComplete) {
        state.courseOutline.sequences[sequenceId].complete = true;
      }

      const sectionId = Object.keys(state.courseOutline.sections)
        .find(id => state.courseOutline.sections[id].sequenceIds.includes(sequenceId));
      const sectionSequences = state.courseOutline.sections[sectionId].sequenceIds;
      const isAllSequencesAreComplete = sectionSequences.every((id) => state.courseOutline.sequences[id].complete);
      const hasLockedSequence = sectionSequences.some((id) => state.courseOutline.sequences[id].type === 'lock');

      // This block of code checks whether all units in the current sequence are complete
      // and if the parent section has a locked (prerequisites) sequence. If both conditions
      // are met, it switches the state of the 'courseOutlineShouldUpdate' flag to true,
      // indicating that the sidebar outline structure needs to be refetched.
      if (isAllUnitsAreComplete && hasLockedSequence) {
        state.courseOutlineShouldUpdate = true;
      }

      // Update amount of completed units of the section
      state.courseOutline.sections[sectionId].completionStat.completed = sectionSequences.reduce(
        (acc, id) => acc + state.courseOutline.sequences[id].completionStat.completed,
        0,
      );

      if (isAllSequencesAreComplete) {
        state.courseOutline.sections[sectionId].complete = true;
      }

      return state;
    },
  },
});

export const {
  fetchCourseRequest,
  fetchCourseSuccess,
  fetchCourseFailure,
  fetchCourseDenied,
  fetchSequenceRequest,
  fetchSequenceSuccess,
  fetchSequenceFailure,
  fetchCourseRecommendationsRequest,
  fetchCourseRecommendationsSuccess,
  fetchCourseRecommendationsFailure,
  fetchCourseOutlineRequest,
  fetchCourseOutlineSuccess,
  fetchCourseOutlineFailure,
  setCoursewareOutlineSidebarToggles,
  updateCourseOutlineCompletion,
} = slice.actions;

export const {
  reducer,
} = slice;
