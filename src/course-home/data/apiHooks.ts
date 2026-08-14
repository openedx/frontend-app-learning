import { logError } from '@edx/frontend-platform/logging';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useToast, ToastContent } from '@src/generic/ToastContext';
import {
  executePostFromPostEvent,
  getCourseHomeCourseMetadata,
  getDatesTabData,
  getOutlineTabData,
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

export const useCourseHomeMeta = (courseId: string) => useQuery({
  queryKey: courseHomeQueryKeys.metadata(courseId),
  queryFn: () => getCourseHomeCourseMetadata(courseId, 'outline'),
  meta: { modelType: 'courseHomeMeta', courseId },
});

export const useDatesTabData = (courseId: string) => useQuery({
  queryKey: courseHomeQueryKeys.datesTab(courseId),
  queryFn: () => getDatesTabData(courseId),
  meta: { modelType: 'dates', courseId },
});

export const useOutlineTabData = (courseId: string) => useQuery({
  queryKey: courseHomeQueryKeys.outlineTab(courseId),
  queryFn: () => getOutlineTabData(courseId),
  meta: { modelType: 'outline', courseId },
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
