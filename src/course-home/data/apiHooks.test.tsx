import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { initializeMockApp } from '../../setupTest';
import { ToastProvider, useToast } from '../../generic/ToastContext';
import {
  useOutlineTabData, useResetDeadlines, usePostEvent, useRequestCert, useDismissWelcomeMessage,
  useSaveWeeklyLearningGoal,
} from './apiHooks';

const { loggingService } = initializeMockApp();

const buildWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
  return { wrapper };
};

describe('course-home apiHooks', () => {
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    loggingService.logError.mockReset();
  });

  describe('useResetDeadlines', () => {
    const resetUrl = `${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`;

    it('POSTs and surfaces the server response as an open toast', async () => {
      axiosMock.onPost(resetUrl).reply(201, {
        header: 'test-toast-header', link: 'test-toast-link', link_text: 'test-toast-body',
      });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => ({ reset: useResetDeadlines(), toast: useToast() }), { wrapper });

      await act(async () => { await result.current.reset.mutateAsync({ courseId: 'course-1', model: 'dates' }); });

      expect(axiosMock.history.post[0].data).toEqual(
        '{"course_key":"course-1","research_event_data":{"location":"dates-tab"}}',
      );
      expect(result.current.toast.toastContent).toEqual({
        message: 'test-toast-header',
        action: { label: 'test-toast-body', href: 'test-toast-link' },
      });
      expect(result.current.toast.isToastOpen).toBe(true);
    });

    it('omits the toast action when the response has no link text', async () => {
      axiosMock.onPost(resetUrl).reply(200, { header: 'done', link: null, link_text: '' });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => ({ reset: useResetDeadlines(), toast: useToast() }), { wrapper });

      await act(async () => { await result.current.reset.mutateAsync({ courseId: 'course-1', model: 'outline' }); });

      expect(result.current.toast.toastContent).toEqual({ message: 'done', action: undefined });
      expect(result.current.toast.isToastOpen).toBe(true);
    });

    it('logs the error when the POST fails', async () => {
      axiosMock.onPost(resetUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useResetDeadlines(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ courseId: 'course-1', model: 'dates' }).catch(() => {});
      });

      await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    });
  });

  describe('usePostEvent', () => {
    const postUrl = 'http://example.com/post-event';

    it('POSTs to the event url and surfaces the response as an open toast', async () => {
      axiosMock.onPost(postUrl).reply(200, {
        header: 'post-header', link: 'post-link', link_text: 'post-body',
      });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => ({ post: usePostEvent(), toast: useToast() }), { wrapper });

      await act(async () => {
        await result.current.post.mutateAsync({
          postData: { url: postUrl, bodyParams: { courseId: 'course-1' } },
          researchEventData: { location: 'unit' },
        });
      });

      expect(axiosMock.history.post[0].url).toEqual(postUrl);
      expect(result.current.toast.toastContent).toEqual({
        message: 'post-header',
        action: { label: 'post-body', href: 'post-link' },
      });
      expect(result.current.toast.isToastOpen).toBe(true);
    });

    it('logs the error when the POST fails', async () => {
      axiosMock.onPost(postUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => usePostEvent(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          postData: { url: postUrl, bodyParams: { courseId: 'course-1' } },
          researchEventData: { location: 'unit' },
        }).catch(() => {});
      });

      await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    });
  });

  describe('useRequestCert', () => {
    const certUrl = `${getConfig().LMS_BASE_URL}/courses/course-1/generate_user_cert`;

    it('POSTs to the request-cert url', async () => {
      axiosMock.onPost(certUrl).reply(200);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useRequestCert(), { wrapper });

      await act(async () => { await result.current.mutateAsync({ courseId: 'course-1' }); });

      expect(axiosMock.history.post[0].url).toEqual(certUrl);
    });

    it('logs the error when the POST fails', async () => {
      axiosMock.onPost(certUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useRequestCert(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ courseId: 'course-1' }).catch(() => {});
      });

      await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    });
  });

  describe('useDismissWelcomeMessage', () => {
    const dismissUrl = `${getConfig().LMS_BASE_URL}/api/course_home/dismiss_welcome_message`;

    it('POSTs to the dismiss url', async () => {
      axiosMock.onPost(dismissUrl).reply(201);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useDismissWelcomeMessage(), { wrapper });

      await act(async () => { await result.current.mutateAsync({ courseId: 'course-1' }); });

      expect(axiosMock.history.post[0].url).toEqual(dismissUrl);
    });

    it('logs the error when the POST fails', async () => {
      axiosMock.onPost(dismissUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useDismissWelcomeMessage(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ courseId: 'course-1' }).catch(() => {});
      });

      await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    });
  });

  describe('useOutlineTabData', () => {
    const outlineUrl = `${getConfig().LMS_BASE_URL}/api/course_home/outline/course-1`;

    it('resolves to an empty object on a 403 (access is handled via the metadata request)', async () => {
      axiosMock.onGet(outlineUrl).reply(403, {});
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useOutlineTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({});
    });

    it('surfaces the error on a non-403 failure', async () => {
      axiosMock.onGet(outlineUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useOutlineTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useSaveWeeklyLearningGoal', () => {
    const goalUrl = `${getConfig().LMS_BASE_URL}/api/course_home/save_course_goal`;

    it('POSTs the weekly learning goal', async () => {
      axiosMock.onPost(goalUrl).reply(200, {});
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useSaveWeeklyLearningGoal(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({ courseId: 'course-1', daysPerWeek: 3, subscribedToReminders: true });
      });

      expect(axiosMock.history.post[0].url).toEqual(goalUrl);
    });

    it('logs the error when the POST fails', async () => {
      axiosMock.onPost(goalUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useSaveWeeklyLearningGoal(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(
          { courseId: 'course-1', daysPerWeek: 3, subscribedToReminders: true },
        ).catch(() => {});
      });

      await waitFor(() => expect(loggingService.logError).toHaveBeenCalled());
    });
  });
});
