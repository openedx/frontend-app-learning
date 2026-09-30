/**
 * URL normalization for courseware: every liberal courseware path converges to
 * /course/:courseId/:sequenceId/:unitId through the redirects below.
 * See docs/decisions/0008-liberal-courseware-path-handling.md.
 */
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation, useParams } from 'react-router-dom';

import {
  parentSequenceQuery, resumeBlockQuery, sequenceMightBeUnit, useIsCourseLoaded, useIsPreview,
  useMinimalCourseOutline, useSequenceMetadata,
} from './data/apiHooks';
import { useCourseHomeMeta } from '../course-home/data/apiHooks';

// The preview routes (DECODE_ROUTES.COURSEWARE) exist for the sequence and unit shapes only; the course
// root has none, so a root destination is never prefixed.
const coursewarePath = (isPreview: boolean, courseId: string, sequenceId?: string, unitId?: string) => {
  const path = `/course/${[courseId, sequenceId, unitId].filter((segment) => segment).join('/')}`;
  return isPreview && sequenceId ? `/preview${path}` : path;
};

// What the rules read: the route, the page's queries from the cache, and the two lookups.
const useRedirectInputs = () => {
  // Every courseware route (DECODE_ROUTES.COURSEWARE) has :courseId.
  const { courseId, sequenceId, unitId } = useParams() as { courseId: string; sequenceId?: string; unitId?: string };
  const { pathname, key: visitKey } = useLocation();
  const isPreview = useIsPreview();
  const isCourseLoaded = useIsCourseLoaded(courseId);
  const courseHomeMeta = useCourseHomeMeta(courseId, { enabled: false }).data;
  const minimalCourseOutlineQuery = useMinimalCourseOutline(courseId, { enabled: false });
  const sequenceQuery = useSequenceMetadata(sequenceId, { enabled: false });
  // The sequence slot may hold a section id: /course/:courseId/:sectionId[/:unitId].
  const section = sequenceId ? minimalCourseOutlineQuery.data?.sections[sequenceId] : undefined;
  const atCourseRoot = isCourseLoaded && !sequenceId;
  const resumeBlock = useQuery({ ...resumeBlockQuery(courseId, visitKey), enabled: atCourseRoot }).data;
  const slotHoldsUnit = isCourseLoaded && sequenceQuery.isError && sequenceMightBeUnit(sequenceQuery)
    && !section && !unitId;
  const parentQuery = useQuery({ ...parentSequenceQuery(courseId, sequenceId!), enabled: slotHoldsUnit });
  return {
    courseId,
    sequenceId,
    unitId,
    pathname,
    isPreview,
    isCourseLoaded,
    courseHomeMeta,
    minimalCourseOutlineQuery,
    sequenceQuery,
    section,
    atCourseRoot,
    resumeBlock,
    slotHoldsUnit,
    parentQuery,
  };
};

type RedirectInputs = ReturnType<typeof useRedirectInputs>;

const getNonStaffPreviewRedirect = (inputs: RedirectInputs): string | null => {
  const { pathname, isPreview, courseHomeMeta } = inputs;

  if (isPreview && courseHomeMeta && !courseHomeMeta.originalUserIsStaff) {
    return pathname.replace('/preview', '');
  }
  return null;
};

const getOutlineFailureRedirect = (inputs: RedirectInputs): string | null => {
  const { courseId, courseHomeMeta, minimalCourseOutlineQuery } = inputs;

  if (
    minimalCourseOutlineQuery.isError
    && courseHomeMeta?.courseAccess.hasAccess // TabPage handles 403s
  ) {
    return `/course/${courseId}/home`;
  }
  return null;
};

// A sequence with no units has no unit URL.
const getEmptySequenceRedirect = (inputs: RedirectInputs): string | null => {
  const {
    courseId, sequenceId, unitId, isPreview, sequenceQuery,
  } = inputs;
  const sequence = sequenceQuery.data?.sequence;

  if (sequence && sequence.unitIds.length === 0 && unitId) {
    return coursewarePath(isPreview, courseId, sequenceId);
  }
  return null;
};

// ADR 0008 form #4: a sequence goes to its active unit; the `first` and `last` markers go to those units.
const getSequenceUnitRedirect = (inputs: RedirectInputs): string | null => {
  const {
    courseId, sequenceId, unitId, isPreview, sequenceQuery,
  } = inputs;
  const sequence = sequenceQuery.data?.sequence;
  const unitIds = sequence?.unitIds ?? [];
  const hasUnits = unitIds.length > 0;
  const activeUnitId = unitIds[sequence?.activeUnitIndex ?? 0];

  if (hasUnits && !unitId) {
    return coursewarePath(isPreview, courseId, sequenceId, activeUnitId);
  }
  if (hasUnits && unitId === 'first') {
    return coursewarePath(isPreview, courseId, sequenceId, unitIds[0]);
  }
  if (hasUnits && unitId === 'last') {
    return coursewarePath(isPreview, courseId, sequenceId, unitIds[unitIds.length - 1]);
  }
  return null;
};

// ADR 0008 form #1: the course root goes to the learner's last position, else the course's first sequence.
const getCourseRootRedirect = (inputs: RedirectInputs): string | null => {
  const {
    courseId, isPreview, minimalCourseOutlineQuery, atCourseRoot, resumeBlock,
  } = inputs;
  const minimalCourseOutline = minimalCourseOutlineQuery.data;
  const firstSectionId = minimalCourseOutline?.courses[courseId].sectionIds[0];
  const firstSequenceId = firstSectionId && minimalCourseOutline?.sections[firstSectionId].sequenceIds[0];

  if (atCourseRoot && resumeBlock?.sectionId && resumeBlock.unitId) {
    return coursewarePath(isPreview, courseId, resumeBlock.sectionId, resumeBlock.unitId);
  }
  if (atCourseRoot && resumeBlock && firstSequenceId) {
    return coursewarePath(isPreview, courseId, firstSequenceId);
  }
  return null;
};

// ADR 0008 forms #2 and #3: the sequence slot holds a section id.
const getSectionRedirect = (inputs: RedirectInputs): string | null => {
  const {
    courseId, unitId, isPreview, isCourseLoaded, sequenceQuery, section,
  } = inputs;

  if (isCourseLoaded && sequenceQuery.isError && section && unitId) {
    return coursewarePath(isPreview, courseId, unitId);
  }
  if (isCourseLoaded && sequenceQuery.isError && section) {
    return coursewarePath(isPreview, courseId, section.sequenceIds[0]);
  }
  return null;
};

// ADR 0008 form #5: the sequence slot holds a unit id, so its parent sequence is looked up.
const getParentSequenceRedirect = (inputs: RedirectInputs): string | null => {
  const {
    courseId, sequenceId, isPreview, slotHoldsUnit, parentQuery,
  } = inputs;

  if (slotHoldsUnit && parentQuery.data) {
    return coursewarePath(isPreview, courseId, parentQuery.data, sequenceId);
  }
  if (slotHoldsUnit && (parentQuery.data === null || parentQuery.isError)) {
    return coursewarePath(isPreview, courseId);
  }
  return null;
};

// Not a sequence, a section or a unit in the sequence slot: the course root.
const getUnknownIdRedirect = (inputs: RedirectInputs): string | null => {
  const {
    courseId, unitId, isPreview, isCourseLoaded, sequenceQuery, section,
  } = inputs;
  const mightBeUnit = sequenceMightBeUnit(sequenceQuery);

  if (isCourseLoaded && sequenceQuery.isError && !section && !mightBeUnit && !unitId) {
    return coursewarePath(isPreview, courseId);
  }
  return null;
};

const CoursewareRedirects = () => {
  const inputs = useRedirectInputs();
  const to = [
    // Access
    getNonStaffPreviewRedirect(inputs),
    // Errors
    getOutlineFailureRedirect(inputs),
    // The sequence has loaded
    getEmptySequenceRedirect(inputs),
    getSequenceUnitRedirect(inputs),
    // The course has loaded (useIsCourseLoaded: courseware metadata, course-home metadata, minimal course outline)
    getCourseRootRedirect(inputs),
    getSectionRedirect(inputs),
    getParentSequenceRedirect(inputs),
    getUnknownIdRedirect(inputs),
  ].find((redirect) => !!redirect);

  return to ? (<Navigate to={to} replace />) : null;
};

export default CoursewareRedirects;
