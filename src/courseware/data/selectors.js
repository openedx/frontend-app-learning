/* eslint-disable import/prefer-default-export */
export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== 'loaded') {
    return [];
  }
  const { sectionIds } = state.models.courses[state.courseware.courseUsageKey];
  let sequenceIds = [];
  sectionIds.forEach(sectionId => {
    sequenceIds = [...sequenceIds, ...state.models.sections[sectionId].sequenceIds];
  });
  return sequenceIds;
}
