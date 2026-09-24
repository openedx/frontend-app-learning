import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { initializeMockApp } from '../../setupTest';
import { getResponseStatus } from '../../data/http-error';
import { ToastProvider, useToast } from '../../generic/ToastContext';
import {
  useCourseHomeMeta,
  useOutlineTabData, useLiveTabData, useProgressTabData, useResetDeadlines, usePostEvent, useRequestCert,
  useDismissWelcomeMessage, useSaveWeeklyLearningGoal, useExamAttemptsData, useProctoringInfoData,
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

  describe('useLiveTabData', () => {
    const liveUrl = `${getConfig().LMS_BASE_URL}/api/course_live/iframe/course-1/`;

    it('resolves to the iframe payload', async () => {
      axiosMock.onGet(liveUrl).reply(200, { iframe: 'https://example.com/live' });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useLiveTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ iframe: 'https://example.com/live' });
    });

    it('resolves to an empty object on a 404', async () => {
      axiosMock.onGet(liveUrl).reply(() => Promise.reject(
        Object.assign(new Error('Request failed with status code 404'), {
          response: { status: 404, data: {} },
          customAttributes: { httpErrorStatus: 404 },
        }),
      ));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useLiveTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({});
    });

    it('surfaces the error on a non-404 failure', async () => {
      axiosMock.onGet(liveUrl).reply(() => Promise.reject(
        Object.assign(new Error('Request failed with status code 500'), {
          response: { status: 500, data: {} },
          customAttributes: { httpErrorStatus: 500 },
        }),
      ));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useLiveTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useProgressTabData', () => {
    const progressUrl = `${getConfig().LMS_BASE_URL}/api/course_home/progress/course-1`;

    it('transforms the server response', async () => {
      axiosMock.onGet(progressUrl).reply(200, Factory.build('progressTabData'));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProgressTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data.studioUrl).toEqual('http://studio.edx.org/settings/grading/course-v1:edX+Test+run');
      expect(result.current.data.gradesFeatureIsFullyLocked).toBe(false);
    });

    it('appends the targetUserId to the request URL', async () => {
      axiosMock.onGet(`${progressUrl}/7/`).reply(200, Factory.build('progressTabData'));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProgressTabData('course-1', '7'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(axiosMock.history.get[0].url).toEqual(`${progressUrl}/7/`);
    });

    it.each([401, 403])(
      'resolves to an empty object on a %s (access is handled via the metadata request)',
      async (status) => {
        axiosMock.onGet(progressUrl).reply(status, {});
        const { wrapper } = buildWrapper();
        const { result } = renderHook(() => useProgressTabData('course-1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({});
      },
    );

    it('surfaces a 404 as an error without navigating', async () => {
      // jsdom's location.replace is non-configurable, so we swap the whole location for the
      // duration of this test (restored in finally so it can never bleed into another test).
      const originalLocation = window.location;
      const replace = jest.fn();
      Object.defineProperty(window, 'location', { configurable: true, value: { replace } });
      try {
        axiosMock.onGet(progressUrl).reply(404, {});
        const { wrapper } = buildWrapper();
        const { result } = renderHook(() => useProgressTabData('course-1'), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(getResponseStatus(result.current.error)).toBe(404);
        expect(replace).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
      }
    });

    it('surfaces the error on a non-handled failure', async () => {
      axiosMock.onGet(progressUrl).reply(500);
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProgressTabData('course-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('stays idle with no request when disabled', () => {
      axiosMock.onGet(progressUrl).reply(200, Factory.build('progressTabData'));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProgressTabData('course-1', undefined, { enabled: false }), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(axiosMock.history.get.filter((req) => req.url?.includes('/course_home/progress/'))).toHaveLength(0);
    });
  });

  describe('useExamAttemptsData', () => {
    const courseId = 'course-1';
    const sequenceIds = ['seq-exam1', 'seq-homework1', 'seq-final'];
    const exam = (name: string) => ({ id: name.length, course_id: courseId, exam_name: name });
    const attemptRequests = () => axiosMock.history.get.filter((req) => req.url?.includes('/exam/attempt/'));
    const rejectWith = (status: number) => () => {
      const error = Object.assign(new Error(`Request failed with status code ${status}`), {
        response: { status, data: {} },
        customAttributes: { httpErrorStatus: status },
      });
      return Promise.reject(error);
    };

    it('resolves to one entry per sequence id, in order, with {} for a 404', async () => {
      axiosMock.onGet(/seq-exam1/).reply(200, { exam: exam('Midterm') });
      axiosMock.onGet(/seq-homework1/).reply(rejectWith(404));
      axiosMock.onGet(/seq-final/).reply(200, { exam: exam('Final') });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useExamAttemptsData(courseId, sequenceIds), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([
        { id: 7, courseId, examName: 'Midterm' },
        {},
        { id: 5, courseId, examName: 'Final' },
      ]);
      expect(attemptRequests()).toHaveLength(3);
    });

    it('logs a failed request, keeps {} in its slot, and still resolves the others', async () => {
      axiosMock.onGet(/seq-exam1/).reply(rejectWith(500));
      axiosMock.onGet(/seq-homework1/).reply(rejectWith(404));
      axiosMock.onGet(/seq-final/).reply(200, { exam: exam('Final') });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useExamAttemptsData(courseId, sequenceIds), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([{}, {}, { id: 5, courseId, examName: 'Final' }]);
      expect(loggingService.logError).toHaveBeenCalledTimes(1);
      expect(loggingService.logError.mock.calls[0][0].customAttributes.httpErrorStatus).toBe(500);
    });

    it('resolves to [] with no requests for an empty sequence list', async () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useExamAttemptsData(courseId, []), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
      expect(attemptRequests()).toHaveLength(0);
    });

    it('does not run until the sequence ids are known', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useExamAttemptsData(courseId, undefined), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
      expect(attemptRequests()).toHaveLength(0);
    });
  });

  describe('useProctoringInfoData', () => {
    const onboardingRequests = () => axiosMock.history.get.filter((req) => req.url?.includes('/onboarding'));
    const rejectWith = (status: number) => () => Promise.reject(Object.assign(new Error(`Request failed with status code ${status}`), {
      response: { status, data: {} },
      customAttributes: { httpErrorStatus: status },
    }));

    it('resolves to the onboarding payload for the given user', async () => {
      axiosMock.onGet(/onboarding/).reply(200, { onboarding_status: 'verified', onboarding_link: 'test' });
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProctoringInfoData('course-1', 'learner'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ onboarding_status: 'verified', onboarding_link: 'test' });
      expect(onboardingRequests()[0].url).toContain('username=learner');
    });

    it('resolves to an empty object on a 404 (no proctoring in the course)', async () => {
      axiosMock.onGet(/onboarding/).reply(rejectWith(404));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProctoringInfoData('course-1', 'learner'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({});
    });

    it('settles as an error on a non-404 failure after a single request', async () => {
      axiosMock.onGet(/onboarding/).reply(rejectWith(500));
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProctoringInfoData('course-1', 'learner'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.isPending).toBe(false);
      expect(onboardingRequests()).toHaveLength(1);
    });

    it('stays idle with no request when disabled', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useProctoringInfoData('course-1', 'learner', { enabled: false }), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(onboardingRequests()).toHaveLength(0);
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

  describe('useCourseHomeMeta', () => {
    const courseId = 'course-1';
    const metadataUrl = new RegExp(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/`);
    const metadataRequests = () => axiosMock.history.get.filter((req) => req.url?.includes('/course_metadata/'));

    beforeEach(() => {
      axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseHomeMetadata'));
    });

    it('serves both contexts from one cache entry', async () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => ({
        courseware: useCourseHomeMeta(courseId),
        outline: useCourseHomeMeta(courseId),
      }), { wrapper });

      await waitFor(() => expect(
        result.current.courseware.isSuccess && result.current.outline.isSuccess,
      ).toBe(true));
      expect(result.current.courseware.data).toBe(result.current.outline.data);
      expect(metadataRequests()).toHaveLength(1);
    });

    it('stays idle with no request when disabled', () => {
      const { wrapper } = buildWrapper();
      const { result } = renderHook(() => useCourseHomeMeta(courseId, { enabled: false }), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(metadataRequests()).toHaveLength(0);
    });
  });
});
