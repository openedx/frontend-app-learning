import { LOADED } from '@src/constants';

export function sequenceIdsSelector(state) {
  if (state.courseware.courseStatus !== LOADED) {
    return [];
  }
  const { sectionIds = [] } = state.models.coursewareMeta[state.courseware.courseId];

  return sectionIds
    .flatMap(sectionId => state.models.sections[sectionId].sequenceIds);
}

export const getSequenceId = state => state.courseware.sequenceId;

export const getCourseOutline = state => state.courseware.courseOutline;

export const getCourseOutlineStatus = state => state.courseware.courseOutlineStatus;

export const getCoursewareOutlineSidebarSettings = state => state.courseware.coursewareOutlineSidebarSettings;

export const getCourseOutlineShouldUpdate = state => state.courseware.courseOutlineShouldUpdate;
