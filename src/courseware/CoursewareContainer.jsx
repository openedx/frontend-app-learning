import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { history } from '@edx/frontend-platform';
import { getLocale } from '@edx/frontend-platform/i18n';
import { useRouteMatch, Redirect } from 'react-router';

import {
  fetchCourse,
  fetchSequence,
  getResumeBlock,
} from '../data';
import {
  checkBlockCompletion,
  saveSequencePosition,
} from './data/thunks';
import { useModel } from '../model-store';
import { TabPage } from '../tab-page';

import Course from './course';
import { sequenceIdsSelector, firstSequenceIdSelector } from './data/selectors';
import { handleNextSectionCelebration } from './course/celebration';

function useUnitNavigationHandler(courseId, sequenceId, unitId) {
  const dispatch = useDispatch();
  return useCallback((nextUnitId) => {
    dispatch(checkBlockCompletion(courseId, sequenceId, unitId));
    history.push(`/course/${courseId}/${sequenceId}/${nextUnitId}`);
  }, [courseId, sequenceId, unitId]);
}

function usePreviousSequence(sequenceId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequences = useSelector(state => state.models.sequences);
  if (!sequenceId || sequenceIds.length === 0) {
    return null;
  }
  const sequenceIndex = sequenceIds.indexOf(sequenceId);
  const previousSequenceId = sequenceIndex > 0 ? sequenceIds[sequenceIndex - 1] : null;
  return previousSequenceId !== null ? sequences[previousSequenceId] : null;
}

function useNextSequence(sequenceId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequences = useSelector(state => state.models.sequences);
  if (!sequenceId || sequenceIds.length === 0) {
    return null;
  }
  const sequenceIndex = sequenceIds.indexOf(sequenceId);
  const nextSequenceId = sequenceIndex < sequenceIds.length - 1 ? sequenceIds[sequenceIndex + 1] : null;
  return nextSequenceId !== null ? sequences[nextSequenceId] : null;
}


function useNextSequenceHandler(courseId, sequenceId) {
  const course = useModel('courses', courseId);
  const sequence = useModel('sequences', sequenceId);
  const nextSequence = useNextSequence(sequenceId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  return useCallback(() => {
    if (nextSequence !== null) {
      if (nextSequence.unitIds.length > 0) {
        const nextUnitId = nextSequence.unitIds[0];
        history.push(`/course/${courseId}/${nextSequence.id}/${nextUnitId}`);
      } else {
        // Some sequences have no units.  This will show a blank page with prev/next buttons.
        history.push(`/course/${courseId}/${nextSequence.id}`);
      }

      const celebrateFirstSection = course && course.celebrations && course.celebrations.firstSection;
      if (celebrateFirstSection && sequence.sectionId !== nextSequence.sectionId) {
        handleNextSectionCelebration(sequenceId, nextSequence.id);
      }
    }
  }, [courseStatus, sequenceStatus, sequenceId]);
}

function usePreviousSequenceHandler(courseId, sequenceId) {
  const previousSequence = usePreviousSequence(sequenceId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  return useCallback(() => {
    if (previousSequence !== null) {
      if (previousSequence.unitIds.length > 0) {
        const previousUnitId = previousSequence.unitIds[previousSequence.unitIds.length - 1];
        history.push(`/course/${courseId}/${previousSequence.id}/${previousUnitId}`);
      } else {
        // Some sequences have no units.  This will show a blank page with prev/next buttons.
        history.push(`/course/${courseId}/${previousSequence.id}`);
      }
    }
  }, [courseStatus, sequenceStatus, sequenceId]);
}

function useExamRedirect(sequenceId) {
  const sequence = useModel('sequences', sequenceId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  useEffect(() => {
    if (sequenceStatus === 'loaded' && sequence.isTimeLimited && sequence.lmsWebUrl !== undefined) {
      global.location.assign(sequence.lmsWebUrl);
    }
  }, [sequenceStatus, sequence]);
}

function useContentRedirect(courseStatus, sequenceStatus) {
  const match = useRouteMatch();
  const { courseId, sequenceId, unitId } = match.params;
  const sequence = useModel('sequences', sequenceId);
  const firstSequenceId = useSelector(firstSequenceIdSelector);
  useEffect(() => {
    if (courseStatus === 'loaded' && !sequenceId) {
      getResumeBlock(courseId).then((data) => {
        // This is a replace because we don't want this change saved in the browser's history.
        if (data.sectionId && data.unitId) {
          history.replace(`/course/${courseId}/${data.sectionId}/${data.unitId}`);
        } else {
          history.replace(`/course/${courseId}/${firstSequenceId}`);
        }
      });
    }
  }, [courseStatus, sequenceId]);

  useEffect(() => {
    if (sequenceStatus === 'loaded' && sequenceId && !unitId) {
      // The position may be null, in which case we'll just assume 0.
      if (sequence.unitIds !== undefined && sequence.unitIds.length > 0) {
        const unitIndex = sequence.position || 0;
        const nextUnitId = sequence.unitIds[unitIndex];
        // This is a replace because we don't want this change saved in the browser's history.
        history.replace(`/course/${courseId}/${sequence.id}/${nextUnitId}`);
      }
    }
  }, [sequenceStatus, sequenceId, unitId]);
}

function useSavedSequencePosition(courseId, sequenceId, unitId) {
  const dispatch = useDispatch();
  const sequence = useModel('sequences', sequenceId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  useEffect(() => {
    if (sequenceStatus === 'loaded' && sequence.savePosition) {
      const activeUnitIndex = sequence.unitIds.indexOf(unitId);
      dispatch(saveSequencePosition(courseId, sequenceId, activeUnitIndex));
    }
  }, [unitId]);
}

export default function CoursewareContainer() {
  const { params } = useRouteMatch();
  const {
    courseId: routeCourseUsageKey,
    sequenceId: routeSequenceId,
    unitId: routeUnitId,
  } = params;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCourse(routeCourseUsageKey));
  }, [routeCourseUsageKey]);

  useEffect(() => {
    if (routeSequenceId) {
      dispatch(fetchSequence(routeSequenceId));
    }
  }, [routeSequenceId]);

  // The courseId and sequenceId in the store are the entities we currently have loaded.
  // We get these two IDs from the store because until fetchCourse and fetchSequence below have
  // finished their work, the IDs in the URL are not representative of what we should actually show.
  // This is important particularly when switching sequences.  Until a new sequence is fully loaded,
  // there's information that we don't have yet - if we use the URL's sequence ID to tell the app
  // which sequence is loaded, we'll instantly try to pull it out of the store and use it, before
  // the sequenceStatus flag has even switched back to "loading", which will put our app into an
  // invalid state.
  const {
    courseId,
    sequenceId,
    courseStatus,
    sequenceStatus,
  } = useSelector(state => state.courseware);

  const nextSequenceHandler = useNextSequenceHandler(courseId, sequenceId);
  const previousSequenceHandler = usePreviousSequenceHandler(courseId, sequenceId);
  const unitNavigationHandler = useUnitNavigationHandler(courseId, sequenceId, routeUnitId);

  useContentRedirect(courseStatus, sequenceStatus);
  useExamRedirect(sequenceId);
  useSavedSequencePosition(courseId, sequenceId, routeUnitId);

  const course = useModel('courses', courseId);

  if (courseStatus === 'denied') {
    switch (course.canLoadCourseware.errorCode) {
      case 'audit_expired':
        return <Redirect to={`/redirect/dashboard?access_response_error=${course.canLoadCourseware.additionalContextUserMessage}`} />;
      case 'course_not_started':
        // eslint-disable-next-line no-case-declarations
        const startDate = (new Intl.DateTimeFormat(getLocale())).format(new Date(course.start));
        return <Redirect to={`/redirect/dashboard?notlive=${startDate}`} />;
      case 'survey_required': // TODO: Redirect to the course survey
      case 'unfulfilled_milestones':
        return <Redirect to="/redirect/dashboard" />;
      case 'authentication_required':
      case 'enrollment_required':
      default:
        return <Redirect to={`/redirect/course-home/${courseId}`} />;
    }
  }

  return (
    <TabPage
      activeTabSlug="courseware"
      courseId={courseId}
      unitId={routeUnitId}
    >
      <Course
        courseId={courseId}
        sequenceId={sequenceId}
        unitId={routeUnitId}
        nextSequenceHandler={nextSequenceHandler}
        previousSequenceHandler={previousSequenceHandler}
        unitNavigationHandler={unitNavigationHandler}
      />
    </TabPage>
  );
}

CoursewareContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      sequenceId: PropTypes.string,
      unitId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
