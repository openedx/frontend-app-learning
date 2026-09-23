import { logError } from '@edx/frontend-platform/logging';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { TabMetadata } from '@src/course-tabs/utils';
import type { RequestError } from '@src/data/http-error';
import { useToast, ToastContent } from '@src/generic/ToastContext';
import {
  executePostFromPostEvent,
  getCourseHomeCourseMetadata,
  getDatesTabData,
  getExamsData,
  getLiveTabIframe,
  getOutlineTabData,
  getProctoringInfoData,
  getProgressTabData,
  postCourseDeadlines,
  postDismissWelcomeMessage,
  postRequestCert,
  postWeeklyLearningGoal,
} from './api';
import { courseHomeQueryKeys } from './queryKeys';

interface CallToActionResponse {
  header: string;
  link: string;
  link_text: string;
}

interface QueryOptions {
  enabled?: boolean;
}

interface PostData {
  url: string;
  bodyParams: { courseId: string };
}

const toastFrom = ({ header, link, link_text: linkText }: CallToActionResponse): ToastContent => ({
  message: header,
  action: linkText ? { label: linkText, href: link } : undefined,
});

export const useResetDeadlines = () => {
  const { setToastContent, openToast } = useToast();
  return useMutation({
    mutationFn: ({ courseId, model }: { courseId: string; model: string }) => postCourseDeadlines(courseId, model),
    onSuccess: ({ data }) => {
      setToastContent(toastFrom(data));
      openToast();
    },
    onError: (error) => logError(error),
  });
};

export const usePostEvent = () => {
  const { setToastContent, openToast } = useToast();
  return useMutation({
    mutationFn: ({ postData, researchEventData }: { postData: PostData; researchEventData: unknown }) => (
      executePostFromPostEvent(postData, researchEventData)
    ),
    onSuccess: ({ data }) => {
      setToastContent(toastFrom(data));
      openToast();
    },
    onError: (error) => logError(error),
  });
};

// Names only the fields this repo's TypeScript readers need; the endpoint returns many more,
// left reachable as `unknown` so plugins importing this hook are not limited to our list.
// The full shape is openedx-platform's to describe — a copy of it here would drift — so this
// stays partial until the platform ships types we can import.
export interface CourseHomeMeta {
  celebrations: {
    streakLengthToCelebrate?: number | null;
    streakDiscountEnabled?: boolean;
  } | null;
  courseAccess: { hasAccess: boolean };
  hasCourseAuthorAccess: boolean;
  number: string;
  org: string;
  originalUserIsStaff: boolean;
  start: string;
  tabs: TabMetadata[];
  title: string;
  verifiedMode: Record<string, unknown> | null;
  [key: string]: unknown;
}

export const useCourseHomeMeta = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery<CourseHomeMeta, RequestError>({
  queryKey: courseHomeQueryKeys.metadata(courseId!),
  queryFn: () => getCourseHomeCourseMetadata(courseId),
  enabled: enabled && !!courseId,
});

export const useDatesTabData = (courseId: string, { enabled = true }: QueryOptions = {}) => useQuery({
  queryKey: courseHomeQueryKeys.datesTab(courseId),
  queryFn: () => getDatesTabData(courseId),
  enabled,
  // Transitional (#1999): the access-expiration masquerade banner still reads this model,
  // via useModel(tab, courseId). Dropped when that reader converts.
  meta: { modelType: 'dates', courseId },
});

export interface OutlineSequence {
  complete: boolean;
  description: string;
  due: string;
  showLink: boolean;
  title: string;
  hideFromTOC: boolean;
  effortActivities?: number;
  effortTime?: number;
}

// Names only the fields this repo's TypeScript readers need; the endpoint returns many more,
// left reachable as `unknown` so plugins importing these hooks are not limited to our list.
// The full shape is openedx-platform's to describe — a copy of it here would drift — so this
// stays partial until the platform ships types we can import. Every field is optional because
// the endpoint's 403 branch returns `{}`.
interface OutlineTabData {
  courseBlocks?: {
    sequences?: Record<string, OutlineSequence>;
  };
  userTimezone?: string;
  [key: string]: unknown;
}

export const useOutlineTabData = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery<OutlineTabData>({
  queryKey: courseHomeQueryKeys.outlineTab(courseId!),
  queryFn: () => getOutlineTabData(courseId),
  enabled: enabled && !!courseId,
  // Transitional (#1999): the access-expiration masquerade banner still reads this model,
  // via useModel(tab, courseId). Dropped when that reader converts.
  meta: { modelType: 'outline', courseId },
});

export const useLiveTabData = (courseId: string) => useQuery({
  queryKey: courseHomeQueryKeys.liveTab(courseId),
  queryFn: () => getLiveTabIframe(courseId),
});

export const useProgressTabData = (
  courseId: string,
  targetUserId?: string,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  queryKey: courseHomeQueryKeys.progressTab(courseId, targetUserId),
  queryFn: () => getProgressTabData(courseId, targetUserId),
  enabled,
  meta: { modelType: 'progress', courseId, logStatusAs: { 404: 'silent' } },
});

export const useExamAttemptsData = (courseId: string | undefined, sequenceIds: string[] | undefined) => useQuery<
Record<string, unknown>[]
>({
  queryKey: courseHomeQueryKeys.examAttempts(courseId!, sequenceIds ?? []),
  queryFn: () => Promise.all((sequenceIds ?? []).map(async (sequenceId) => {
    try {
      return (await getExamsData(courseId, sequenceId)).exam || {};
    } catch (error) {
      logError(error as Error);
      return {};
    }
  })),
  enabled: !!courseId && !!sequenceIds,
});

export const useProctoringInfoData = (
  courseId: string,
  username?: string,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  queryKey: courseHomeQueryKeys.proctoringInfo(courseId, username),
  queryFn: () => getProctoringInfoData(courseId, username),
  enabled,
  retry: false,
});

export const useRequestCert = () => useMutation({
  mutationFn: ({ courseId }: { courseId: string }) => postRequestCert(courseId),
  onError: (error) => logError(error),
});

export const useDismissWelcomeMessage = () => useMutation({
  mutationFn: ({ courseId }: { courseId: string }) => postDismissWelcomeMessage(courseId),
  onError: (error) => logError(error),
});

export const useSaveWeeklyLearningGoal = () => useMutation({
  mutationFn: ({ courseId, daysPerWeek, subscribedToReminders }: {
    courseId: string; daysPerWeek: number; subscribedToReminders: boolean;
  }) => postWeeklyLearningGoal(courseId, daysPerWeek, subscribedToReminders),
  onError: (error) => logError(error),
});
