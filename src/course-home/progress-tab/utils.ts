import { getConfig } from '@edx/frontend-platform';

/* eslint-disable import/prefer-default-export */
export const showUngradedAssignments = () => (
  getConfig().SHOW_UNGRADED_ASSIGNMENT_PROGRESS === 'true'
  || getConfig().SHOW_UNGRADED_ASSIGNMENT_PROGRESS === true
);

// Returns the subsections for an assignment type
const getSubsectionsOfType = (assignmentType, sectionScores) => (sectionScores || []).reduce((acc, chapter) => {
  const subs = (chapter.subsections || []).filter(
    (s) => s.assignmentType === assignmentType,
  );
  return acc.concat(subs);
}, []);

// Returns True if this subsection is "hidden"
const isSubsectionHidden = (sub) => sub.showCorrectness === 'never_but_include_grade';

// Returns True if all grades are hidden for this assignment type
export const areAllGradesHiddenForType = (assignmentType, sectionScores) => {
  const subs = getSubsectionsOfType(assignmentType, sectionScores);
  if (subs.length === 0) { return false; } // no subsections -> treat as not hidden
  return subs.every(isSubsectionHidden);
};

// Returns True if some grades are hidden for this assignment type
export const areSomeGradesHiddenForType = (assignmentType, sectionScores) => {
  const subs = getSubsectionsOfType(assignmentType, sectionScores);
  return subs.some(isSubsectionHidden) && !areAllGradesHiddenForType(assignmentType, sectionScores);
};

export const getLatestDueDateInFuture = (sectionScores) => {
  let latest = null;
  sectionScores.forEach((chapter) => {
    chapter.subsections.forEach((subsection) => {
      if (subsection.due && (!latest || new Date(subsection.due) > new Date(latest))
         && new Date(subsection.due) > new Date()) {
        latest = subsection.due;
      }
    });
  });
  return latest;
};
