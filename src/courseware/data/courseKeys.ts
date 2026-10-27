const USAGE_KEY_PATTERN = /^(?:ccx-)?block-v1:(.+?)\+type@/;
const COURSE_KEY_PATTERN = /^(?:course|ccx)-v1:(.+)/;

// branch@ / version@ name a revision of the same course, so they are left out of the comparison.
const normalizeKeyBody = (keyBody: string) => keyBody.toLowerCase().replace(/\+(?:branch|version)@[^+]*/g, '');

/**
 * Whether the usage key names a block of the given course; a CCX also owns its master course's blocks.
 * Unrecognised key formats count as belonging, so an unexpected format never hides content.
 */
export const isBlockInCourse = (usageKey: string | undefined, courseId: string | undefined): boolean => {
  const usageMatch = USAGE_KEY_PATTERN.exec(usageKey ?? '');
  const courseMatch = COURSE_KEY_PATTERN.exec(courseId ?? '');
  if (!usageMatch || !courseMatch) {
    return true;
  }
  const block = normalizeKeyBody(usageMatch[1]);
  const course = normalizeKeyBody(courseMatch[1]);
  return block === course || block === course.replace(/\+ccx@[^+]*$/, '');
};

/** Whether the sequence and unit IDs of a courseware route both belong to its course. */
export const isRouteInCourse = (courseId: string | undefined, sequenceId?: string, unitId?: string): boolean => (
  isBlockInCourse(sequenceId, courseId) && isBlockInCourse(unitId, courseId)
);
