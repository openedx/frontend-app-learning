/* eslint-disable import/prefer-default-export */
export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return [];
  }
  const { sectionIds } = state.models.courses[state.courseware.courseId];
  let sequenceIds = [];
  sectionIds.forEach(sectionId => {
    sequenceIds = [...sequenceIds, ...state.models.sections[sectionId].sequenceIds];
  });
  return sequenceIds;
}

export function firstSequenceIdSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return null;
  }
  const sectionId = state.models.courses[state.courseware.courseId].sectionIds[0];
  return state.models.sections[sectionId].sequenceIds[0];
}
