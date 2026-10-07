import MockAdapter from 'axios-mock-adapter';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { initializeMockApp } from '../setupTest';
import { mockSpecialExams } from './mockSpecialExams';

initializeMockApp();

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@exam';
const examsBaseUrl = 'http://localhost:18740';

describe('mockSpecialExams', () => {
  let axiosMock: MockAdapter;
  const http = () => getAuthenticatedHttpClient();

  beforeEach(() => {
    mergeConfig({ EXAMS_BASE_URL: examsBaseUrl });
    axiosMock = new MockAdapter(http());
  });

  afterEach(() => {
    axiosMock.restore();
    jest.useRealTimers();
  });

  describe('edx-exams family (EXAMS_BASE_URL set)', () => {
    const examUrl = `${examsBaseUrl}/api/v1/student/exam/attempt/course_id/${courseId}/content_id/${sequenceId}`;
    const latestUrl = `${examsBaseUrl}/api/v1/exams/attempt/latest`;

    it('answers "no exam" for a sequence that was never set', async () => {
      mockSpecialExams(axiosMock, courseId);
      expect((await http().get(examUrl)).data).toEqual({ exam: {} });
      expect((await http().get(latestUrl)).data).toEqual({});
    });

    it('serves the ported library-shape exam with no attempt by default', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { exam: { type: 'proctored' } });
      const { exam } = (await http().get(examUrl)).data;
      expect(exam).toMatchObject({
        id: 1, course_id: courseId, content_id: sequenceId, type: 'proctored', attempt: {},
      });
      expect(mock.statusOf(sequenceId)).toBeNull();
      expect((await http().get(latestUrl)).data).toEqual({});
    });

    it('creates a started attempt on POST with start_clock and exposes it as the active attempt', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId);
      const { data } = await http().post(`${examsBaseUrl}/api/v1/exams/attempt`, {
        exam_id: 1, start_clock: 'true', attempt_proctored: 'false',
      });
      expect(data).toEqual({ exam_attempt_id: 1 });
      expect(mock.statusOf(sequenceId)).toBe('started');
      const active = (await http().get(latestUrl)).data;
      expect(active).toMatchObject({ attempt_id: 1, attempt_status: 'started', exam_type: 'timed' });
      expect((await http().get(examUrl)).data.exam.attempt).toMatchObject({ attempt_status: 'started' });
    });

    it('creates a `created` attempt for a proctored start and `declined` for a skip', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { exam: { type: 'proctored' } });
      await http().post(`${examsBaseUrl}/api/v1/exams/attempt`, { exam_id: 1, start_clock: 'false', attempt_proctored: 'true' });
      expect(mock.statusOf(sequenceId)).toBe('created');
      mock.setExam(sequenceId, { exam: { type: 'proctored' } });
      await http().post(`${examsBaseUrl}/api/v1/exams/attempt`, { exam_id: 1, start_clock: 'false', attempt_proctored: 'false' });
      expect(mock.statusOf(sequenceId)).toBe('declined');
    });

    it('applies PUT actions: stop, start, submit, reset_attempt', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { status: 'started' });
      const put = (action: string) => http().put(`${examsBaseUrl}/api/v1/exams/attempt/1`, { action });
      await put('stop');
      expect(mock.statusOf(sequenceId)).toBe('ready_to_submit');
      await put('start');
      expect(mock.statusOf(sequenceId)).toBe('started');
      await put('submit');
      expect(mock.statusOf(sequenceId)).toBe('submitted');
      expect((await http().get(latestUrl)).data).toEqual({}); // no longer active
      await put('reset_attempt');
      expect(mock.statusOf(sequenceId)).toBeNull();
      expect(mock.requests.filter((r) => r.method === 'PUT').map((r) => r.body?.action))
        .toEqual(['stop', 'start', 'submit', 'reset_attempt']);
    });

    it('counts the remaining time down from the limit since the start', async () => {
      jest.useFakeTimers({ now: new Date('2026-10-07T10:00:00Z') });
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { status: 'started', exam: { time_limit_mins: 30 } });
      jest.setSystemTime(new Date('2026-10-07T10:10:00Z'));
      const poll = (await http().get(`${latestUrl}?content_id=${encodeURIComponent(sequenceId)}`)).data;
      expect(poll.time_remaining_seconds).toBe(20 * 60);
      expect(poll.attempt_status).toBe('started');
    });

    it('serves provider settings and the access token, and fails them on request', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, {
        exam: { type: 'proctored' },
        proctoringSettings: { provider_name: 'Mock Provider' },
        accessToken: { exam_access_token: 'TOKEN' },
      });
      const settings = (await http().get(`${examsBaseUrl}/api/v1/exam/provider_settings/course_id/${courseId}/exam_id/1`)).data;
      expect(settings).toMatchObject({ provider_name: 'Mock Provider', exam_proctoring_backend: expect.any(Object) });
      expect((await http().get(`${examsBaseUrl}/api/v1/access_tokens/exam_id/1/`)).data.exam_access_token).toBe('TOKEN');
      mock.setExam(sequenceId, { failTokenGet: true });
      await expect(http().get(`${examsBaseUrl}/api/v1/access_tokens/exam_id/1/`)).rejects.toMatchObject({ response: { status: 500 } });
    });

    it('fails the exam GET on request', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { failExamGet: true });
      await expect(http().get(examUrl)).rejects.toMatchObject({ response: { status: 500 } });
    });
  });

  describe('LMS edx_proctoring family (EXAMS_BASE_URL unset)', () => {
    const lms = () => getConfig().LMS_BASE_URL;
    const courseUrl = () => `${lms()}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/${courseId}`;

    beforeEach(() => {
      mergeConfig({ EXAMS_BASE_URL: '' });
    });

    it('serves the exam for content_id and the active attempt without it, from one endpoint', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { status: 'ready_to_submit' });
      const forSequence = (await http().get(`${courseUrl()}?content_id=${encodeURIComponent(sequenceId)}&is_learning_mfe=true`)).data;
      expect(forSequence.exam).toMatchObject({ content_id: sequenceId, attempt: { attempt_status: 'ready_to_submit' } });
      expect(forSequence.active_attempt).toMatchObject({ attempt_id: 1, attempt_status: 'ready_to_submit' });
      const latest = (await http().get(`${courseUrl()}?is_learning_mfe=true`)).data;
      expect(latest).toEqual({ exam: {}, active_attempt: expect.objectContaining({ attempt_id: 1 }) });
    });

    it('answers the legacy poll URL, create, update, settings and review policy', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { exam: { type: 'proctored' }, reviewPolicy: 'No notes.' });
      await http().post(`${lms()}/api/edx_proctoring/v1/proctored_exam/attempt`, { exam_id: 1, start_clock: 'true', attempt_proctored: 'false' });
      await http().put(`${lms()}/api/edx_proctoring/v1/proctored_exam/attempt/1`, { action: 'stop' });
      const poll = (await http().get(`${lms()}/api/edx_proctoring/v1/proctored_exam/attempt/1`)).data;
      expect(poll).toMatchObject({ status: 'ready_to_submit', time_remaining_seconds: expect.any(Number) });
      expect((await http().get(`${lms()}/api/edx_proctoring/v1/proctored_exam/settings/exam_id/1/`)).data)
        .toMatchObject({ exam_proctoring_backend: expect.any(Object) });
      expect((await http().get(`${lms()}/api/edx_proctoring/v1/proctored_exam/review_policy/exam_id/1/`)).data)
        .toEqual({ review_policy: 'No notes.' });
    });

    it('rejects an unknown PUT action loudly rather than inventing a state', async () => {
      const mock = mockSpecialExams(axiosMock, courseId);
      mock.setExam(sequenceId, { status: 'started' });
      await expect(http().put(`${lms()}/api/edx_proctoring/v1/proctored_exam/attempt/1`, { action: 'teleport' }))
        .rejects.toThrow('unknown attempt action teleport');
    });
  });
});
