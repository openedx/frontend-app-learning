/**
 * URL normalization for courseware: every liberal courseware path converges to
 * /course/:courseId/:sequenceId/:unitId through the redirect rules below.
 * See docs/decisions/0008-liberal-courseware-path-handling.md.
 *
 * The rules are fire-once guards: useCoursewareRedirects applies them on every render,
 * and each is memoized with shallowEqual over its args object — so no args field may be
 * a per-render fresh literal, or the rule runs on every render.
 */
import { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { defaultMemoize as memoize } from 'reselect';

import {
  getResumeBlock,
  getSequenceForUnitDeprecated,
} from './data';
import {
  sequenceMightBeUnit, useCoursewareOutline, useIsCourseLoaded, useSequenceMetadata,
} from './data/apiHooks';
import { useCourseHomeMeta } from '../course-home/data/apiHooks';
import { readModels } from './data/modelReader';
import type { RootState } from '../store';

interface RedirectArgsBase {
  courseId?: string;
  navigate: NavigateFunction;
  isPreview: boolean;
}

interface ResumeRedirectArgs extends RedirectArgsBase {
  isCourseLoaded: boolean;
  sequenceId?: string;
  firstSequenceId: string | null;
}

// The failed-sequence family: course loaded, sequence failed, resolving via the section.
interface SectionRedirectArgs extends RedirectArgsBase {
  isCourseLoaded: boolean;
  isSequenceFailed: boolean;
  section: { sequenceIds?: string[] } | null;
  unitId?: string | null;
}

interface UnitToSequenceUnitRedirectArgs extends RedirectArgsBase {
  isCourseLoaded: boolean;
  isSequenceFailed: boolean;
  mightBeUnit: boolean;
  sequenceId?: string;
  section: { sequenceIds?: string[] } | null;
  routeUnitId?: string | null;
}

interface OutlineFailureRedirectArgs extends RedirectArgsBase {
  isOutlineFailed: boolean;
  hasAccess: boolean;
}

interface SequenceRedirectArgs extends RedirectArgsBase {
  isSequenceLoaded: boolean;
  sequence: any; // untyped model-store object; null until isSequenceLoaded (store dissolves in #1977)
  unitId?: string | null;
}

// Resume redirect:
//   /course/:courseId -> /course/:courseId/:sequenceId/:unitId
// based on sequence/unit where user was last active.
export const resumeRedirect = memoize(
  ({
    isCourseLoaded, courseId, sequenceId, firstSequenceId, navigate, isPreview,
  }: ResumeRedirectArgs) => {
    if (isCourseLoaded && !sequenceId) {
      // Note that getResumeBlock is just an API call, not a redux thunk.
      getResumeBlock(courseId).then((data) => {
        // This is a replace because we don't want this change saved in the browser's history.
        if (data.sectionId && data.unitId) {
          const baseUrl = `/course/${courseId}/${data.sectionId}`;
          const sequenceUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
          navigate(`${sequenceUrl}/${data.unitId}`, { replace: true });
        } else if (firstSequenceId) {
          navigate(`/course/${courseId}/${firstSequenceId}`, { replace: true });
        }
      }, () => {});
    }
  },
  shallowEqual,
);

// Section-unit to unit redirect:
//    /course/:courseId/:sectionId/:unitId -> /course/:courseId/:unitId
// by simply ignoring the :sectionId.
// (It may be desirable at some point to be smarter here; for example, we could replace
//  :sectionId with the parent sequence of :unitId and/or check whether the :unitId
//  is actually within :sectionId. However, the way our Redux store is currently factored,
//  the unit's metadata is not available to us if the section isn't loadable.)
// Before performing this redirect, we *do* still check that a section is loadable;
// otherwise, we could get stuck in a redirect loop, since a sequence that failed to load
// would endlessly redirect to itself through `sectionUnitToUnitRedirect`
// and `unitToSequenceUnitRedirect`.
export const sectionUnitToUnitRedirect = memoize((
  {
    isCourseLoaded, courseId, isSequenceFailed, section, unitId, navigate, isPreview,
  }: SectionRedirectArgs,
) => {
  if (isCourseLoaded && isSequenceFailed && section && unitId) {
    const baseUrl = `/course/${courseId}`;
    const courseUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
    navigate(`${courseUrl}/${unitId}`, { replace: true });
  }
}, shallowEqual);

// Section to sequence redirect:
//    /course/:courseId/:sectionId         -> /course/:courseId/:sequenceId
// by redirecting to the first sequence within the section.
export const sectionToSequenceRedirect = memoize(
  ({
    isCourseLoaded, courseId, isSequenceFailed, section, unitId, navigate,
  }: SectionRedirectArgs) => {
    if (isCourseLoaded && isSequenceFailed && section && !unitId) {
      // If the section is non-empty, redirect to its first sequence.
      if (section.sequenceIds && section.sequenceIds[0]) {
        navigate(`/course/${courseId}/${section.sequenceIds[0]}`, { replace: true });
      // Otherwise, just go to the course root, letting the resume redirect take care of things.
      } else {
        navigate(`/course/${courseId}`, { replace: true });
      }
    }
  },
  shallowEqual,
);

// Unit to sequence-unit redirect:
//    /course/:courseId/:unitId -> /course/:courseId/:sequenceId/:unitId
// by filling in the ID of the parent sequence of :unitId.
export const unitToSequenceUnitRedirect = memoize((
  {
    isCourseLoaded, courseId, isSequenceFailed, mightBeUnit, sequenceId, section, routeUnitId, navigate, isPreview,
  }: UnitToSequenceUnitRedirectArgs,
) => {
  if (isCourseLoaded && isSequenceFailed && !section && !routeUnitId) {
    if (mightBeUnit) {
      // If the sequence failed to load as a sequence, but it is marked as a possible unit, then
      // we need to look up the correct parent sequence for it, and redirect there.
      const unitId = sequenceId; // just for clarity during the rest of this method
      getSequenceForUnitDeprecated(courseId, unitId).then(
        parentId => {
          if (parentId) {
            const baseUrl = `/course/${courseId}/${parentId}`;
            const sequenceUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
            navigate(`${sequenceUrl}/${unitId}`, { replace: true });
          } else {
            navigate(`/course/${courseId}`, { replace: true });
          }
        },
        () => { // error case
          navigate(`/course/${courseId}`, { replace: true });
        },
      );
    } else {
      // Invalid sequence that isn't a unit either. Redirect up to main course.
      navigate(`/course/${courseId}`, { replace: true });
    }
  }
}, shallowEqual);

// Sequence to sequence-unit redirect:
//    /course/:courseId/:sequenceId -> /course/:courseId/:sequenceId/:unitId
// by filling in the ID the most-recently-active unit in the sequence, OR
// the ID of the first unit the sequence if none is active.
export const sequenceToSequenceUnitRedirect = memoize(
  ({
    courseId, isSequenceLoaded, sequence, unitId, navigate, isPreview,
  }: SequenceRedirectArgs) => {
    if (isSequenceLoaded && sequence.id && !unitId) {
      if (sequence.unitIds !== undefined && sequence.unitIds.length > 0) {
        const baseUrl = `/course/${courseId}/${sequence.id}`;
        const sequenceUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
        const nextUnitId = sequence.unitIds[sequence.activeUnitIndex];
        // This is a replace because we don't want this change saved in the browser's history.
        navigate(`${sequenceUrl}/${nextUnitId}`, { replace: true });
      }
    }
  },
  shallowEqual,
);

// Sequence-unit marker to sequence-unit redirect:
//    /course/:courseId/:sequenceId/first -> /course/:courseId/:sequenceId/:unitId
//    /course/:courseId/:sequenceId/last -> /course/:courseId/:sequenceId/:unitId
// by filling in the ID the first or last unit in the sequence.
// "Sequence unit marker" is an invented term used only in this module.
export const sequenceUnitMarkerToSequenceUnitRedirect = memoize(
  ({
    courseId, isSequenceLoaded, sequence, unitId, navigate, isPreview,
  }: SequenceRedirectArgs) => {
    if (!isSequenceLoaded || !sequence.id) {
      return;
    }

    const baseUrl = `/course/${courseId}/${sequence.id}`;
    const hasUnits = sequence.unitIds?.length > 0;

    if (hasUnits) {
      const sequenceUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
      if (unitId === 'first') {
        const firstUnitId = sequence.unitIds[0];
        navigate(`${sequenceUrl}/${firstUnitId}`, { replace: true });
      } else if (unitId === 'last') {
        const lastUnitId = sequence.unitIds[sequence.unitIds.length - 1];
        navigate(`${sequenceUrl}/${lastUnitId}`, { replace: true });
      }
    } else {
      // No units... go to general sequence page
      navigate(baseUrl, { replace: true });
    }
  },
  shallowEqual,
);

// Outline-failure redirect:
//    any courseware URL -> /course/:courseId/home
// when the outline failed but the learner has access — the page can't be built without
// an outline, and the course home is where the access-denied path also lands. (A 403
// outline means no access, which TabPage's denied redirect covers via courseHomeMeta.)
export const outlineFailureRedirect = memoize(
  ({
    isOutlineFailed, hasAccess, courseId, navigate,
  }: OutlineFailureRedirectArgs) => {
    if (isOutlineFailed && hasAccess) {
      navigate(`/course/${courseId}/home`, { replace: true });
    }
  },
  shallowEqual,
);

export const useCoursewareRedirects = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    courseId,
    sequenceId,
    unitId: routeUnitId,
  } = useParams();
  const isPreview = pathname.startsWith('/preview');

  const isCourseLoaded = useIsCourseLoaded(courseId);
  const outlineQuery = useCoursewareOutline(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId);
  const sequenceQuery = useSequenceMetadata(sequenceId);
  const isSequenceLoaded = sequenceQuery.isSuccess;
  const isSequenceFailed = sequenceQuery.isError;
  const mightBeUnit = sequenceMightBeUnit(sequenceQuery);

  const sequence = useSelector(
    (state: RootState) => (sequenceId ? readModels(state).sequences?.[sequenceId] : null) ?? null,
  );
  const sectionViaSequenceId = useSelector(
    (state: RootState) => (sequenceId ? readModels(state).sections?.[sequenceId] : null) ?? null,
  );
  const course = useSelector(
    (state: RootState) => (courseId ? readModels(state).coursewareMeta?.[courseId] : null) ?? null,
  );
  const firstSectionId = isCourseLoaded ? (course?.sectionIds ?? [])[0] : undefined;
  const firstSection = useSelector(
    (state: RootState) => (firstSectionId ? readModels(state).sections?.[firstSectionId] : null) ?? null,
  );
  const firstSequenceId = firstSection ? firstSection.sequenceIds[0] : null;

  useEffect(() => {
    outlineFailureRedirect({
      isOutlineFailed: outlineQuery.isError,
      hasAccess: !!courseHomeMetaQuery.data?.courseAccess?.hasAccess,
      courseId,
      navigate,
      isPreview,
    });
    resumeRedirect({
      isCourseLoaded, courseId, sequenceId, firstSequenceId, navigate, isPreview,
    });
    sectionUnitToUnitRedirect({
      isCourseLoaded,
      courseId,
      isSequenceFailed,
      section: sectionViaSequenceId,
      unitId: routeUnitId,
      navigate,
      isPreview,
    });
    sectionToSequenceRedirect({
      isCourseLoaded,
      courseId,
      isSequenceFailed,
      section: sectionViaSequenceId,
      unitId: routeUnitId,
      navigate,
      isPreview,
    });
    unitToSequenceUnitRedirect({
      isCourseLoaded,
      courseId,
      isSequenceFailed,
      mightBeUnit,
      sequenceId,
      section: sectionViaSequenceId,
      routeUnitId,
      navigate,
      isPreview,
    });
    sequenceToSequenceUnitRedirect({
      courseId,
      isSequenceLoaded,
      sequence,
      unitId: routeUnitId,
      navigate,
      isPreview,
    });
    sequenceUnitMarkerToSequenceUnitRedirect({
      courseId,
      isSequenceLoaded,
      sequence,
      unitId: routeUnitId,
      navigate,
      isPreview,
    });
  });
};
