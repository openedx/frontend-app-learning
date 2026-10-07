import type MockAdapter from 'axios-mock-adapter';
import type { AxiosRequestConfig } from 'axios';
import { Factory } from 'rosie';
import { getConfig } from '@edx/frontend-platform';

// Registers the `specialExam*` factories, the library's own payload shapes.
import './specialExamsFactories';

// A stateful mock of the special-exams backend, for both URL families `@edx/frontend-lib-special-exams`
// talks to: the LMS `edx_proctoring` endpoints (no `EXAMS_BASE_URL`) and edx-exams (`EXAMS_BASE_URL`
// set, as `.env.test` does). `mockCourseRequests` registers it before its catch-all handler and returns
// it, so a test configures the exam for a sequence with `setExam` and the handlers read that state at
// request time: GET exam / latest attempt return the current attempt, POST creates one, PUT applies its
// `action`, the poll returns the status and the remaining time.

export type AttemptStatus =
  | 'created' | 'download_software_clicked' | 'ready_to_start' | 'started' | 'ready_to_submit'
  | 'submitted' | 'second_review_required' | 'verified' | 'rejected' | 'error'
  | 'onboarding_missing' | 'onboarding_pending' | 'onboarding_failed' | 'onboarding_expired'
  | 'declined'
  | (string & {}); // the library's "unknown status" page is a learner-facing state too

export interface ExamScenario {
  /** Overrides for the `specialExam` factory (`type`, `passed_due_date`, `hide_after_due`, …). */
  exam?: Record<string, unknown>;
  /** The attempt's status; absent or `null` means no attempt yet. */
  status?: AttemptStatus | null;
  /** Overrides for the `specialExamAttempt` factory (`use_legacy_attempt_api`, `attempt_ready_to_resume`, …). */
  attempt?: Record<string, unknown>;
  /** Overrides for the `specialExamProctoringSettings` factory. */
  proctoringSettings?: Record<string, unknown>;
  reviewPolicy?: string;
  /** Overrides for the `specialExamAccessToken` factory. */
  accessToken?: Record<string, unknown>;
  /** Fixed `time_remaining_seconds`; otherwise it counts down from `time_limit_mins` since the start. */
  remainingSeconds?: number;
  failExamGet?: boolean;
  /** Fail the latest-attempt GET (the outer timer's request) with a 500, whether or not an attempt is active. */
  failLatestGet?: boolean;
  failTokenGet?: boolean;
}

export interface RecordedRequest {
  method: string;
  url: string;
  /** The `action` of a PUT, or the create payload's `start_clock` / `attempt_proctored` of a POST. */
  body?: Record<string, unknown>;
}

export interface SpecialExamsMock {
  /** Make `sequenceId` an exam sequence in the given state. Replaces any earlier scenario for it. */
  setExam(sequenceId: string, scenario?: ExamScenario): void;
  /** The current attempt status for the sequence (`null` = no attempt), or `undefined` if it is not an exam. */
  statusOf(sequenceId: string): AttemptStatus | null | undefined;
  /** Every request the handlers answered, in order. */
  readonly requests: RecordedRequest[];
}

const ACTIVE_STATUSES: AttemptStatus[] = ['started', 'ready_to_submit'];
const TRANSITIONS: Record<string, AttemptStatus | null> = {
  start: 'started',
  stop: 'ready_to_submit',
  submit: 'submitted',
  reset_attempt: null,
  decline: 'declined',
  click_download_software: 'download_software_clicked',
  error: 'error',
};

interface SequenceState {
  examId: number;
  scenario: ExamScenario;
  status: AttemptStatus | null;
  startedAt: number;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseBody = (config: AxiosRequestConfig): Record<string, unknown> => (
  typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? {})
);
const contentIdOf = (config: AxiosRequestConfig) => (
  new URL(config.url!, 'http://placeholder').searchParams.get('content_id')
);
const idInUrl = (config: AxiosRequestConfig, pattern: RegExp) => Number(config.url!.match(pattern)![1]);
type Reply = [number, Record<string, unknown>];

export function mockSpecialExams(axiosMock: MockAdapter, courseId: string): SpecialExamsMock {
  const { LMS_BASE_URL, EXAMS_BASE_URL } = getConfig();
  const sequences = new Map<string, SequenceState>();
  const requests: RecordedRequest[] = [];
  let nextExamId = 1;

  const record = (config: AxiosRequestConfig, body?: Record<string, unknown>) => {
    requests.push({ method: config.method!.toUpperCase(), url: config.url!, ...(body ? { body } : {}) });
  };

  const byContentId = (contentId: string | null) => (
    contentId ? sequences.get(decodeURIComponent(contentId)) : undefined
  );
  const entryByExamId = (examId: number) => [...sequences.entries()].find(([, s]) => s.examId === examId);
  const byExamId = (examId: number) => entryByExamId(examId)?.[1];
  const activeEntry = () => [...sequences.entries()].find(
    ([, s]) => s.status !== null && ACTIVE_STATUSES.includes(s.status),
  );
  const latestFails = () => [...sequences.values()].some((s) => s.scenario.failLatestGet);

  const remainingSeconds = (state: SequenceState, exam: { time_limit_mins: number }) => (
    state.scenario.remainingSeconds
      ?? Math.max(exam.time_limit_mins * 60 - (Date.now() - state.startedAt) / 1000, -10)
  );

  const buildExam = (sequenceId: string, state: SequenceState) => Factory.build('specialExam', {
    id: state.examId,
    course_id: courseId,
    content_id: sequenceId,
    ...state.scenario.exam,
  });

  const buildAttempt = (sequenceId: string, state: SequenceState) => {
    if (state.status === null) { return {}; }
    const exam = buildExam(sequenceId, state);
    return Factory.build('specialExamAttempt', {
      attempt_id: state.examId,
      attempt_status: state.status,
      exam_type: exam.type,
      exam_display_name: exam.exam_name,
      course_id: courseId,
      time_remaining_seconds: remainingSeconds(state, exam),
      exam_started_poll_url: `/api/edx_proctoring/v1/proctored_exam/attempt/${state.examId}`,
      use_legacy_attempt_api: exam.use_legacy_attempt_api ?? true,
      ...state.scenario.attempt,
    });
  };

  const examPayload = (sequenceId: string) => {
    const state = sequences.get(sequenceId);
    if (!state) { return {}; }
    return { ...buildExam(sequenceId, state), attempt: buildAttempt(sequenceId, state) };
  };

  const activeAttemptPayload = () => {
    const entry = activeEntry();
    return entry ? buildAttempt(entry[0], entry[1]) : {};
  };

  const settingsPayload = (state?: SequenceState) => Factory.build('specialExamProctoringSettings', state?.scenario.proctoringSettings);
  const tokenPayload = (state?: SequenceState) => Factory.build('specialExamAccessToken', state?.scenario.accessToken);

  const setStatus = (sequenceId: string, state: SequenceState, status: AttemptStatus | null) => {
    const startedAt = status === 'started' && state.status !== 'started' ? Date.now() : state.startedAt;
    sequences.set(sequenceId, { ...state, status, startedAt });
  };

  const statusAfterCreate = (body: Record<string, unknown>): AttemptStatus => {
    if (body.start_clock === 'true') { return 'started'; }
    if (body.attempt_proctored === 'true') { return 'created'; }
    return 'declined'; // the skip-proctoring path
  };

  const onCreate = (config: AxiosRequestConfig): Reply => {
    const body = parseBody(config);
    record(config, { start_clock: body.start_clock, attempt_proctored: body.attempt_proctored });
    const entry = entryByExamId(Number(body.exam_id));
    if (!entry) { return [404, {}]; }
    setStatus(entry[0], entry[1], statusAfterCreate(body));
    return [200, { exam_attempt_id: entry[1].examId }];
  };

  const onUpdate = (config: AxiosRequestConfig): Reply => {
    const body = parseBody(config);
    record(config, { action: body.action });
    const action = body.action as string;
    if (!(action in TRANSITIONS)) { throw new Error(`mockSpecialExams: unknown attempt action ${action}`); }
    const entry = entryByExamId(idInUrl(config, /attempt\/(\d+)$/));
    if (!entry) { return [404, {}]; }
    setStatus(entry[0], entry[1], TRANSITIONS[action]);
    return [200, { exam_attempt_id: entry[1].examId }];
  };

  const lms = escapeRegExp(LMS_BASE_URL);

  // LMS edx_proctoring family (used when EXAMS_BASE_URL is unset). The course-level GET serves the
  // exam for `content_id` (the sequence tree) or, without one, the latest attempt (the outer timer).
  const legacyCourseUrl = new RegExp(`^${lms}/api/edx_proctoring/v1/proctored_exam/attempt/course_id/[^/?]+(\\?.*)?$`);
  axiosMock.onGet(legacyCourseUrl).reply((config) => {
    record(config);
    const contentId = contentIdOf(config);
    const state = byContentId(contentId);
    if (contentId && state?.scenario.failExamGet) { return [500, { detail: 'exam unavailable' }]; }
    if (!contentId && latestFails()) { return [500, { detail: 'attempt unavailable' }]; }
    return [200, {
      exam: contentId ? examPayload(decodeURIComponent(contentId)) : {},
      active_attempt: activeAttemptPayload(),
    }];
  });
  axiosMock.onGet(new RegExp(`^${lms}/api/edx_proctoring/v1/proctored_exam/attempt/\\d+$`)).reply((config) => {
    record(config);
    const entry = entryByExamId(idInUrl(config, /attempt\/(\d+)$/));
    if (!entry) { return [404, {}]; }
    const [sequenceId, state] = entry;
    return [200, {
      status: state.status,
      time_remaining_seconds: remainingSeconds(state, buildExam(sequenceId, state)),
    }];
  });
  axiosMock.onPost(`${LMS_BASE_URL}/api/edx_proctoring/v1/proctored_exam/attempt`).reply(onCreate);
  axiosMock.onPut(new RegExp(`^${lms}/api/edx_proctoring/v1/proctored_exam/attempt/\\d+$`)).reply(onUpdate);
  const legacySettingsUrl = new RegExp(`^${lms}/api/edx_proctoring/v1/proctored_exam/settings/exam_id/\\d+/$`);
  axiosMock.onGet(legacySettingsUrl).reply((config) => {
    record(config);
    return [200, settingsPayload(byExamId(idInUrl(config, /exam_id\/(\d+)\/$/)))];
  });
  const reviewPolicyUrl = new RegExp(`^${lms}/api/edx_proctoring/v1/proctored_exam/review_policy/exam_id/\\d+/$`);
  axiosMock.onGet(reviewPolicyUrl).reply((config) => {
    record(config);
    const state = byExamId(idInUrl(config, /exam_id\/(\d+)\/$/));
    return [200, { review_policy: state?.scenario.reviewPolicy ?? '' }];
  });

  // edx-exams family (EXAMS_BASE_URL set). The exam and the latest attempt are separate endpoints;
  // `latest` with `content_id` is the poll for an exam sequence, without it the active attempt.
  if (EXAMS_BASE_URL) {
    const exams = escapeRegExp(EXAMS_BASE_URL);
    const examUrl = new RegExp(`^${exams}/api/v1/student/exam/attempt/course_id/[^/]+/content_id/[^/?]+$`);
    axiosMock.onGet(examUrl).reply((config) => {
      record(config);
      const sequenceId = decodeURIComponent(config.url!.match(/content_id\/([^/?]+)$/)![1]);
      if (sequences.get(sequenceId)?.scenario.failExamGet) { return [500, { detail: 'exam unavailable' }]; }
      return [200, { exam: examPayload(sequenceId) }];
    });
    axiosMock.onGet(new RegExp(`^${exams}/api/v1/exams/attempt/latest(\\?.*)?$`)).reply((config) => {
      record(config);
      const contentId = contentIdOf(config);
      if (!contentId && latestFails()) { return [500, { detail: 'attempt unavailable' }]; }
      if (contentId) {
        const sequenceId = decodeURIComponent(contentId);
        const state = sequences.get(sequenceId);
        const attempt = state ? buildAttempt(sequenceId, state) : {};
        // edx-exams names the field `attempt_status`; the library renames it to `status` for polling.
        return [200, attempt];
      }
      return [200, activeAttemptPayload()];
    });
    axiosMock.onPost(`${EXAMS_BASE_URL}/api/v1/exams/attempt`).reply(onCreate);
    axiosMock.onPut(new RegExp(`^${exams}/api/v1/exams/attempt/\\d+$`)).reply(onUpdate);
    const providerSettingsUrl = new RegExp(`^${exams}/api/v1/exam/provider_settings/course_id/[^/]+/exam_id/\\d+$`);
    axiosMock.onGet(providerSettingsUrl).reply((config) => {
      record(config);
      return [200, settingsPayload(byExamId(idInUrl(config, /exam_id\/(\d+)$/)))];
    });
    axiosMock.onGet(new RegExp(`^${exams}/api/v1/access_tokens/exam_id/\\d+/$`)).reply((config) => {
      record(config);
      const state = byExamId(idInUrl(config, /exam_id\/(\d+)\/$/));
      if (state?.scenario.failTokenGet) { return [500, { detail: 'token unavailable' }]; }
      return [200, tokenPayload(state)];
    });
  }

  return {
    setExam(sequenceId, scenario = {}) {
      const existing = sequences.get(sequenceId);
      const examId = existing?.examId ?? nextExamId++;
      sequences.set(sequenceId, {
        examId, scenario, status: scenario.status ?? null, startedAt: Date.now(),
      });
    },
    statusOf: (sequenceId) => sequences.get(sequenceId)?.status,
    requests,
  };
}
