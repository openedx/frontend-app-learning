import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createSelector } from '@reduxjs/toolkit';
import { defaultMemoize as memoize } from 'reselect';

import {
  checkBlockCompletion,
  fetchCourse,
  fetchSequence,
  getResumeBlock,
  getSequenceForUnitDeprecated,
  saveSequencePosition,
} from './data';
import { useCourseStatusBridge } from './data/statusBridge';
import { TabPage } from '../tab-page';
import type { CourseStatus } from '../tab-page/TabPage';
import type { RootState } from '../store';

import Course from './course';
import { handleNextSectionCelebration } from './course/celebration';

// Look at where this is called in the render effect for more info about its usage
export const checkResumeRedirect = memoize(
  (courseStatus, courseId, sequenceId, firstSequenceId, navigate, isPreview) => {
    if (courseStatus === 'loaded' && !sequenceId) {
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
);

// Look at where this is called in the render effect for more info about its usage
export const checkSectionUnitToUnitRedirect = memoize((
  courseStatus,
  courseId,
  sequenceStatus,
  section,
  unitId,
  navigate,
  isPreview,
) => {
  if (courseStatus === 'loaded' && sequenceStatus === 'failed' && section && unitId) {
    const baseUrl = `/course/${courseId}`;
    const courseUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
    navigate(`${courseUrl}/${unitId}`, { replace: true });
  }
});

// Look at where this is called in the render effect for more info about its usage
export const checkSectionToSequenceRedirect = memoize(
  (courseStatus, courseId, sequenceStatus, section, unitId, navigate) => {
    if (courseStatus === 'loaded' && sequenceStatus === 'failed' && section && !unitId) {
      // If the section is non-empty, redirect to its first sequence.
      if (section.sequenceIds && section.sequenceIds[0]) {
        navigate(`/course/${courseId}/${section.sequenceIds[0]}`, { replace: true });
      // Otherwise, just go to the course root, letting the resume redirect take care of things.
      } else {
        navigate(`/course/${courseId}`, { replace: true });
      }
    }
  },
);

// Look at where this is called in the render effect for more info about its usage
export const checkUnitToSequenceUnitRedirect = memoize((
  courseStatus,
  courseId,
  sequenceStatus,
  sequenceMightBeUnit,
  sequenceId,
  section,
  routeUnitId,
  navigate,
  isPreview,
) => {
  if (courseStatus === 'loaded' && sequenceStatus === 'failed' && !section && !routeUnitId) {
    if (sequenceMightBeUnit) {
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
});

// Look at where this is called in the render effect for more info about its usage
export const checkSequenceToSequenceUnitRedirect = memoize(
  (courseId, sequenceStatus, sequence, unitId, navigate, isPreview) => {
    if (sequenceStatus === 'loaded' && sequence.id && !unitId) {
      if (sequence.unitIds !== undefined && sequence.unitIds.length > 0) {
        const baseUrl = `/course/${courseId}/${sequence.id}`;
        const sequenceUrl = isPreview ? `/preview${baseUrl}` : baseUrl;
        const nextUnitId = sequence.unitIds[sequence.activeUnitIndex];
        // This is a replace because we don't want this change saved in the browser's history.
        navigate(`${sequenceUrl}/${nextUnitId}`, { replace: true });
      }
    }
  },
);

// Look at where this is called in the render effect for more info about its usage
export const checkSequenceUnitMarkerToSequenceUnitRedirect = memoize(
  (courseId, sequenceStatus, sequence, unitId, navigate, isPreview) => {
    if (sequenceStatus !== 'loaded' || !sequence.id) {
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
);

const currentCourseSelector = createSelector(
  (state) => state.models.coursewareMeta || {},
  (state) => state.courseware.courseId,
  (coursesById, courseId) => (coursesById[courseId] ? coursesById[courseId] : null),
);

const currentSequenceSelector = createSelector(
  (state) => state.models.sequences || {},
  (state) => state.courseware.sequenceId,
  (sequencesById, sequenceId) => (sequencesById[sequenceId] ? sequencesById[sequenceId] : null),
);

const sequenceIdsSelector = createSelector(
  (state) => state.courseware.courseStatus,
  currentCourseSelector,
  (state) => state.models.sections,
  (courseStatus, course, sectionsById) => {
    if (courseStatus !== 'loaded') {
      return [];
    }
    const { sectionIds = [] } = course;
    return sectionIds.flatMap(sectionId => sectionsById[sectionId].sequenceIds);
  },
);

const nextSequenceSelector = createSelector(
  sequenceIdsSelector,
  (state) => state.models.sequences || {},
  (state) => state.courseware.sequenceId,
  (sequenceIds, sequencesById, sequenceId) => {
    if (!sequenceId || sequenceIds.length === 0) {
      return null;
    }
    const sequenceIndex = sequenceIds.indexOf(sequenceId);
    const nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
    return nextSequenceId !== null ? sequencesById[nextSequenceId] : null;
  },
);

const firstSequenceIdSelector = createSelector(
  (state) => state.courseware.courseStatus,
  currentCourseSelector,
  (state) => state.models.sections || {},
  (courseStatus, course, sectionsById) => {
    if (courseStatus !== 'loaded') {
      return null;
    }
    const { sectionIds = [] } = course;

    if (sectionIds.length === 0) {
      return null;
    }

    return sectionsById[sectionIds[0]].sequenceIds[0];
  },
);

const sectionViaSequenceIdSelector = createSelector(
  (state) => state.models.sections || {},
  (state) => state.courseware.sequenceId,
  (sectionsById, sequenceId) => (sectionsById[sequenceId] ? sectionsById[sequenceId] : null),
);

const CoursewareContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    courseId: routeCourseId,
    sequenceId: routeSequenceId,
    unitId: routeUnitId,
  } = useParams();
  const isPreview = pathname.startsWith('/preview');

  const courseId = useSelector((state: RootState) => state.courseware.courseId);
  const sequenceId = useSelector((state: RootState) => state.courseware.sequenceId);
  const courseStatus = useSelector((state: RootState) => state.courseware.courseStatus) as CourseStatus;
  const sequenceStatus = useSelector((state: RootState) => state.courseware.sequenceStatus);
  const sequenceMightBeUnit = useSelector((state: RootState) => state.courseware.sequenceMightBeUnit);
  const course = useSelector(currentCourseSelector);
  const sequence = useSelector(currentSequenceSelector);
  const nextSequence = useSelector(nextSequenceSelector);
  const firstSequenceId = useSelector(firstSequenceIdSelector);
  const sectionViaSequenceId = useSelector(sectionViaSequenceIdSelector);

  useCourseStatusBridge(routeCourseId);

  const latest = useRef<any>();

  const guards = useRef<any>();
  if (!guards.current) {
    guards.current = {
      checkFetchCourse: memoize((id) => {
        dispatch(fetchCourse(id));
      }),
      checkFetchSequence: memoize((id) => {
        if (id) {
          dispatch(fetchSequence(id, latest.current.isPreview));
        }
      }),
      checkSaveSequencePosition: memoize((unitId) => {
        const {
          courseId: cId,
          sequenceId: sId,
          sequenceStatus: sStatus,
          sequence: seq,
        } = latest.current;
        if (sStatus === 'loaded' && seq.saveUnitPosition && unitId) {
          const activeUnitIndex = seq.unitIds.indexOf(unitId);
          dispatch(saveSequencePosition(cId, sId, activeUnitIndex));
        }
      }),
    };
  }

  useEffect(() => {
    latest.current = {
      courseId,
      sequenceId,
      sequenceStatus,
      sequence,
      isPreview,
    };
    const { checkFetchCourse, checkFetchSequence, checkSaveSequencePosition } = guards.current;

    // Load data whenever the course or sequence ID changes.
    checkFetchCourse(routeCourseId);
    checkFetchSequence(routeSequenceId);

    // Check if we should save our sequence position.  Only do this when the route unit ID changes.
    checkSaveSequencePosition(routeUnitId);

    // Coerce the route ids into null here because they can be undefined, but the redux ids would be null instead.
    if (courseId !== (routeCourseId || null) || sequenceId !== (routeSequenceId || null)) {
      // The non-route ids are pulled from redux state - they are changed at the same time as the status variables.
      // But the route ids are pulled directly from the route. So if the route changes, and we start a fetch above,
      // there's a race condition where the route ids are for one course, but the status and the other ids are for a
      // different course. Since all the logic below depends on the status variables and the route unit id, we'll wait
      // until the ids match and thus the redux states got updated. So just bail for now.
      return;
    }

    // All courseware URLs should normalize to the format /course/:courseId/:sequenceId/:unitId
    // via the series of redirection rules below.
    // See docs/decisions/0008-liberal-courseware-path-handling.md for more context.
    // (It would be ideal to move this logic into the thunks layer and perform
    //  all URL-changing checks at once. See TNL-8182.)

    // Check resume redirect:
    //   /course/:courseId -> /course/:courseId/:sequenceId/:unitId
    // based on sequence/unit where user was last active.
    checkResumeRedirect(courseStatus, courseId, sequenceId, firstSequenceId, navigate, isPreview);

    // Check section-unit to unit redirect:
    //    /course/:courseId/:sectionId/:unitId -> /course/:courseId/:unitId
    // by simply ignoring the :sectionId.
    // (It may be desirable at some point to be smarter here; for example, we could replace
    //  :sectionId with the parent sequence of :unitId and/or check whether the :unitId
    //  is actually within :sectionId. However, the way our Redux store is currently factored,
    //  the unit's metadata is not available to us if the section isn't loadable.)
    // Before performing this redirect, we *do* still check that a section is loadable;
    // otherwise, we could get stuck in a redirect loop, since a sequence that failed to load
    // would endlessly redirect to itself through `checkSectionUnitToUnitRedirect`
    // and `checkUnitToSequenceUnitRedirect`.
    checkSectionUnitToUnitRedirect(
      courseStatus,
      courseId,
      sequenceStatus,
      sectionViaSequenceId,
      routeUnitId,
      navigate,
      isPreview,
    );

    // Check section to sequence redirect:
    //    /course/:courseId/:sectionId         -> /course/:courseId/:sequenceId
    // by redirecting to the first sequence within the section.
    checkSectionToSequenceRedirect(
      courseStatus,
      courseId,
      sequenceStatus,
      sectionViaSequenceId,
      routeUnitId,
      navigate,
    );

    // Check unit to sequence-unit redirect:
    //    /course/:courseId/:unitId -> /course/:courseId/:sequenceId/:unitId
    // by filling in the ID of the parent sequence of :unitId.
    checkUnitToSequenceUnitRedirect(
      courseStatus,
      courseId,
      sequenceStatus,
      sequenceMightBeUnit,
      sequenceId,
      sectionViaSequenceId,
      routeUnitId,
      navigate,
      isPreview,
    );

    // Check sequence to sequence-unit redirect:
    //    /course/:courseId/:sequenceId -> /course/:courseId/:sequenceId/:unitId
    // by filling in the ID the most-recently-active unit in the sequence, OR
    // the ID of the first unit the sequence if none is active.
    checkSequenceToSequenceUnitRedirect(
      courseId,
      sequenceStatus,
      sequence,
      routeUnitId,
      navigate,
      isPreview,
    );

    // Check sequence-unit marker to sequence-unit redirect:
    //    /course/:courseId/:sequenceId/first -> /course/:courseId/:sequenceId/:unitId
    //    /course/:courseId/:sequenceId/last -> /course/:courseId/:sequenceId/:unitId
    // by filling in the ID the first or last unit in the sequence.
    // "Sequence unit marker" is an invented term used only in this component.
    checkSequenceUnitMarkerToSequenceUnitRedirect(
      courseId,
      sequenceStatus,
      sequence,
      routeUnitId,
      navigate,
      isPreview,
    );
  });

  const handleUnitNavigationClick = () => {
    dispatch(checkBlockCompletion(courseId, sequenceId, routeUnitId));
  };

  const handleNextSequenceClick = () => {
    if (nextSequence !== null) {
      const celebrateFirstSection = course && course.celebrations && course.celebrations.firstSection;
      if (celebrateFirstSection && sequence.sectionId !== nextSequence.sectionId) {
        handleNextSectionCelebration(sequenceId, nextSequence.id);
      }
    }
  };

  const handlePreviousSequenceClick = () => {};

  return (
    <TabPage
      activeTabSlug="courseware"
      courseId={courseId ?? undefined}
      unitId={routeUnitId}
      courseStatus={courseStatus}
    >
      <Course
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={routeUnitId}
        nextSequenceHandler={handleNextSequenceClick}
        previousSequenceHandler={handlePreviousSequenceClick}
        unitNavigationHandler={handleUnitNavigationClick}
      />
    </TabPage>
  );
};

export default CoursewareContainer;
