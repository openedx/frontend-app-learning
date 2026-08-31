import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useCoursewareOutline } from './apiHooks';
import {
  fetchCourseDenied,
  fetchCourseFailure,
  fetchCourseRequest,
  fetchCourseSuccess,
} from './slice';

// Transitional: bridges the courseware query state into the Redux `courseStatus` field so
// the still-Redux readers (the container's redirect helpers/selectors and TabPage's string
// status) keep working; removed when those readers move to React Query.
export const useCourseStatusBridge = (courseId: string | undefined) => {
  const dispatch = useDispatch();
  const metadataQuery = useCoursewareMetadata(courseId);
  const outlineQuery = useCoursewareOutline(courseId);
  const courseHomeMetaQuery = useCourseHomeMeta(courseId, 'courseware');

  const { isPending: metadataPending, isSuccess: metadataSuccess } = metadataQuery;
  const { isPending: outlinePending, isSuccess: outlineSuccess } = outlineQuery;
  const { isPending: courseHomePending, isSuccess: courseHomeSuccess, error: courseHomeError } = courseHomeMetaQuery;
  const hasAccess = courseHomeMetaQuery.data?.courseAccess?.hasAccess;

  useEffect(() => {
    if (!courseId) {
      return;
    }
    if (metadataPending || outlinePending || courseHomePending) {
      dispatch(fetchCourseRequest({ courseId }));
      return;
    }
    if (metadataSuccess && courseHomeSuccess) {
      if (hasAccess && outlineSuccess) {
        dispatch(fetchCourseSuccess({ courseId }));
      } else {
        dispatch(fetchCourseDenied({ courseId }));
      }
      return;
    }
    const { status, data } = courseHomeError?.response ?? {};
    if (status === 403 && data) {
      dispatch(fetchCourseFailure({ courseId, errorMessage: data.detail, errorCode: data.error_code }));
    } else {
      dispatch(fetchCourseFailure({ courseId }));
    }
  }, [courseId, metadataPending, outlinePending, courseHomePending,
    metadataSuccess, courseHomeSuccess, outlineSuccess, hasAccess, courseHomeError, dispatch]);
};

// The CourseExit variant: no outline query, and it takes its queries as params because
// CourseExit also feeds them to its own TabPage gating. Same transitional job — keeps the slice
// `courseId`/`courseStatus` written for the exit page's still-Redux children.
export const useCourseExitStatusBridge = (
  courseId: string | undefined,
  metadataQuery: ReturnType<typeof useCoursewareMetadata>,
  courseHomeMetaQuery: ReturnType<typeof useCourseHomeMeta>,
) => {
  const dispatch = useDispatch();

  const { isPending: metadataPending, isSuccess: metadataSuccess } = metadataQuery;
  const { isPending: courseHomePending, isSuccess: courseHomeSuccess, error: courseHomeError } = courseHomeMetaQuery;
  const hasAccess = courseHomeMetaQuery.data?.courseAccess?.hasAccess;

  useEffect(() => {
    if (!courseId) {
      return;
    }
    if (metadataPending || courseHomePending) {
      dispatch(fetchCourseRequest({ courseId }));
      return;
    }
    if (metadataSuccess && courseHomeSuccess) {
      if (hasAccess) {
        dispatch(fetchCourseSuccess({ courseId }));
      } else {
        dispatch(fetchCourseDenied({ courseId }));
      }
      return;
    }
    const { status, data } = courseHomeError?.response ?? {};
    if (status === 403 && data) {
      dispatch(fetchCourseFailure({ courseId, errorMessage: data.detail, errorCode: data.error_code }));
    } else {
      dispatch(fetchCourseFailure({ courseId }));
    }
  }, [courseId, metadataPending, courseHomePending, metadataSuccess, courseHomeSuccess,
    hasAccess, courseHomeError, dispatch]);
};
