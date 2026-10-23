import { logError } from '@openedx/frontend-base';
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';

import { appId } from '@src/constants';
import { useToast, ToastContent } from '@src/generic/ToastContext';
import {
  type CallToActionResponse,
  type PostEventData,
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

const courseHomeKey = [appId, 'courseHome'] as const;

interface QueryOptions {
  enabled?: boolean;
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
    mutationFn: ({ postData, researchEventData }: { postData: PostEventData; researchEventData: unknown }) => (
      executePostFromPostEvent(postData, researchEventData)
    ),
    onSuccess: ({ data }) => {
      setToastContent(toastFrom(data));
      openToast();
    },
    onError: (error) => logError(error),
  });
};

export const courseHomeMetaQuery = (courseId: string) => queryOptions({
  queryKey: [...courseHomeKey, 'metadata', courseId] as const,
  queryFn: () => getCourseHomeCourseMetadata(courseId),
});

export const useCourseHomeMeta = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  ...courseHomeMetaQuery(courseId!),
  enabled: enabled && !!courseId,
});

export const datesTabDataQuery = (courseId: string) => queryOptions({
  queryKey: [...courseHomeKey, 'datesTab', courseId] as const,
  queryFn: () => getDatesTabData(courseId),
});

export const useDatesTabData = (courseId: string, { enabled = true }: QueryOptions = {}) => useQuery({
  ...datesTabDataQuery(courseId),
  enabled,
});

export const outlineTabDataQuery = (courseId: string) => queryOptions({
  queryKey: [...courseHomeKey, 'outlineTab', courseId] as const,
  queryFn: () => getOutlineTabData(courseId),
});

export const useOutlineTabData = (
  courseId: string | undefined,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  ...outlineTabDataQuery(courseId!),
  enabled: enabled && !!courseId,
});

export const liveTabDataQuery = (courseId: string) => queryOptions({
  queryKey: [...courseHomeKey, 'liveTab', courseId] as const,
  queryFn: () => getLiveTabIframe(courseId),
});

export const useLiveTabData = (courseId: string) => useQuery(liveTabDataQuery(courseId));

export const progressTabDataQuery = (courseId: string, targetUserId?: string) => queryOptions({
  queryKey: [...courseHomeKey, 'progressTab', courseId, targetUserId] as const,
  queryFn: () => getProgressTabData(courseId, targetUserId),
  meta: { logStatusAs: { 404: 'silent' } },
});

export const useProgressTabData = (
  courseId: string,
  targetUserId?: string,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  ...progressTabDataQuery(courseId, targetUserId),
  enabled,
});

export const examAttemptsDataQuery = (courseId: string, sequenceIds: string[]) => queryOptions({
  queryKey: [...courseHomeKey, 'examAttempts', courseId, sequenceIds] as const,
  queryFn: () => Promise.all(sequenceIds.map(async (sequenceId) => {
    try {
      return (await getExamsData(courseId, sequenceId)).exam || {};
    } catch (error) {
      logError(error as Error);
      return {};
    }
  })),
});

export const useExamAttemptsData = (courseId: string | undefined, sequenceIds: string[] | undefined) => useQuery({
  ...examAttemptsDataQuery(courseId!, sequenceIds ?? []),
  enabled: !!courseId && !!sequenceIds,
});

export const proctoringInfoDataQuery = (courseId: string, username?: string) => queryOptions({
  queryKey: [...courseHomeKey, 'proctoringInfo', courseId, username] as const,
  queryFn: () => getProctoringInfoData(courseId, username),
  retry: false,
});

export const useProctoringInfoData = (
  courseId: string,
  username?: string,
  { enabled = true }: QueryOptions = {},
) => useQuery({
  ...proctoringInfoDataQuery(courseId, username),
  enabled,
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
