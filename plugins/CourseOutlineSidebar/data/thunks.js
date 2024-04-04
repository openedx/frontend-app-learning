import { logError } from '@edx/frontend-platform/logging';

import { FAILED, LOADED } from '@src/course-home/data/slice';
import { addModelPlugin } from '@src/generic/plugin-store';
import { getCourseOutline } from './api';
import { ID } from '../constants';

export function getCourseOutlineStructure(courseId) {
  return async (dispatch) => {
    dispatch(addModelPlugin({ modelType: ID, nameField: 'structure', model: {} }));
    dispatch(addModelPlugin({ modelType: ID, nameField: 'loadingStatus', model: null }));
    try {
      const data = await getCourseOutline(courseId);
      dispatch(addModelPlugin({ modelType: ID, nameField: 'structure', model: data }));
      dispatch(addModelPlugin({ modelType: ID, nameField: 'loadingStatus', model: LOADED }));
      dispatch(addModelPlugin({ modelType: ID, nameField: 'courseOutlineShouldUpdate', model: false }));
    } catch (error) {
      logError(error);
      dispatch(addModelPlugin({ modelType: ID, nameField: 'structure', model: {} }));
      dispatch(addModelPlugin({ modelType: ID, nameField: 'loadingStatus', model: FAILED }));
    }
  };
}

export function updateCourseOutlineCompletion(unitIds) {
  return async (dispatch, getState) => {
    const state = getState().plugins[ID] || {};

    if (!Object.keys(state.structure).length) {
      return false;
    }

    const newStructure = JSON.parse(JSON.stringify(state.structure));

    // eslint-disable-next-line no-return-assign
    unitIds.map((id) => newStructure.units[id].complete = true);

    const sequenceIds = new Set(unitIds.map((unitId) => Object.keys(newStructure.sequences)
      .find(id => newStructure.sequences[id].unitIds.includes(unitId))));

    sequenceIds.forEach((sequenceId) => {
      const sequenceUnits = newStructure.sequences[sequenceId].unitIds;
      const isAllUnitsAreComplete = sequenceUnits.every((id) => newStructure.units[id].complete);

      if (isAllUnitsAreComplete) {
        newStructure.sequences[sequenceId].complete = true;
      }

      const sectionId = Object.keys(newStructure.sections)
        .find(id => newStructure.sections[id].sequenceIds.includes(sequenceId));
      const sectionSequences = newStructure.sections[sectionId].sequenceIds;
      const isAllSequencesAreComplete = sectionSequences.every((id) => newStructure.sequences[id].complete);
      const hasLockedSequence = sectionSequences.some((id) => newStructure.sequences[id].type === 'lock');

      // This block of code checks whether all units in the current sequence are complete
      // and if the parent section has a locked (prerequisites) sequence. If both conditions
      // are met, it switches the state of the 'courseOutlineShouldUpdate' flag to true,
      // indicating that the sidebar outline structure needs to be refetched.
      if (isAllUnitsAreComplete && hasLockedSequence) {
        dispatch(addModelPlugin({ modelType: ID, nameField: 'courseOutlineShouldUpdate', model: true }));
      }

      if (isAllSequencesAreComplete) {
        newStructure.sections[sectionId].complete = true;
      }
    });
    dispatch(addModelPlugin({ modelType: ID, nameField: 'structure', model: newStructure }));
    return true;
  };
}
