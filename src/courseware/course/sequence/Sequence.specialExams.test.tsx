import { Factory } from 'rosie';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { mergeConfig } from '@edx/frontend-platform';
import type { ExamScenario } from '@edx/frontend-lib-special-exams/testing';

import {
  act, mockCourseRequests, render, screen, waitFor, within,
} from '../../../setupTest';
import MountCourseQueryHooks from '../../../tests/MountCourseQueryHooks';
import { SidebarProvider } from '../sidebar/SidebarContext';
import Sequence from './Sequence';

jest.mock('@edx/frontend-platform/analytics');

const EXAMS_BASE_URL = 'http://localhost:18740';
const OVERTIME_TITLE = 'The time allotted for this exam has expired. Your exam has been submitted and any work you completed will be graded.';

interface CourseOptions {
  courseMetadata?: Record<string, unknown>;
  courseHomeMetadata?: Record<string, unknown>;
  sequence?: Record<string, unknown>;
}

const mockExamCourse = ({ courseMetadata, courseHomeMetadata, sequence = {} }: CourseOptions = {}) => {
  const course = Factory.build('courseMetadata', courseMetadata);
  const unitBlocks = [Factory.build('block', { type: 'vertical' }, { courseId: course.id })];
  const sequenceBlocks = [Factory.build(
    'block',
    { type: 'sequential', children: unitBlocks.map((block) => block.id) },
    { courseId: course.id },
  )];
  const sequenceMetadata = [Factory.build(
    'sequenceMetadata',
    { is_time_limited: true, ...sequence },
    { courseId: course.id, unitBlocks, sequenceBlock: sequenceBlocks[0] },
  )];
  return mockCourseRequests({
    courseMetadata: course,
    courseHomeMetadata: courseHomeMetadata && Factory.build('courseHomeMetadata', courseHomeMetadata),
    unitBlocks,
    sequenceBlocks,
    sequenceMetadata,
  });
};

type Course = ReturnType<typeof mockExamCourse>;
let course: Course;

const renderSequence = (rendered: Course) => {
  course = rendered;
  const { courseId, sequenceId, unitId } = rendered;
  return render(
    <MemoryRouter initialEntries={[`/course/${courseId}/${sequenceId}/${unitId}`]}>
      <Routes>
        <Route
          path="/course/:courseId/:sequenceId/*"
          element={(
            <SidebarProvider courseId={courseId} unitId={unitId} widgets={[]}>
              <MountCourseQueryHooks courseId={courseId} sequenceId={sequenceId} />
              <Sequence
                courseId={courseId}
                sequenceId={sequenceId}
                unitId={unitId}
                unitNavigationHandler={() => {}}
                nextSequenceHandler={() => {}}
                previousSequenceHandler={() => {}}
              />
            </SidebarProvider>
        )}
        />
      </Routes>
    </MemoryRouter>,
    {},
  );
};

const renderExam = (scenario: ExamScenario, options?: CourseOptions) => {
  const examCourse = mockExamCourse(options);
  examCourse.specialExams.setExam(examCourse.sequenceId, scenario);
  renderSequence(examCourse);
  return examCourse;
};

const examRequests = () => course.specialExams.requests
  .filter(({ url }) => url.includes('/student/exam/attempt/') || url.includes('/proctored_exam/attempt/course_id/'));
const latestAttemptRequests = () => course.specialExams.requests.filter(({ url }) => url.includes('/exams/attempt/latest'));
const tokenRequests = () => course.specialExams.requests.filter(({ url }) => url.includes('/access_tokens/'));
const putActions = () => course.specialExams.requests
  .filter(({ method }) => method === 'PUT').map(({ body }) => body?.action);
const unitTitle = () => course.unitBlocks[0].display_name;
const findUnitFrame = () => screen.findByTitle(unitTitle());
const unitFrame = () => screen.getByTitle(unitTitle());
const queryUnitFrame = () => screen.queryByTitle(unitTitle());
const timerText = () => screen.getByText(/You are taking/);
const timerAlert = () => timerText().closest('[role="alert"]') as HTMLElement;
const endExamButton = () => screen.getByRole('button', { name: 'End My Exam' });
const examAccessParam = () => new URL(unitFrame().getAttribute('src') ?? '').searchParams.get('exam_access');

// jsdom cannot navigate; the library writes `location.href` and calls `location.assign`.
let locationStub: { href: string; assign: jest.Mock };
const stubLocation = () => {
  const original = window.location;
  beforeEach(() => {
    locationStub = { ...original, href: original.href, assign: jest.fn() };
    Object.defineProperty(window, 'location', { configurable: true, value: locationStub });
  });
  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: original });
  });
};

describe('Sequence with a special exam', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mergeConfig({ EXAMS_BASE_URL });
    user = userEvent.setup();
  });

  afterEach(async () => {
    await act(async () => { await jest.runOnlyPendingTimersAsync(); });
    jest.useRealTimers();
  });

  describe('timed exam', () => {
    describe('with no attempt', () => {
      beforeEach(async () => {
        course = renderExam({});
        await screen.findByText('Subsection is a Timed Exam (30 minutes)');
      });

      it('shows the entrance instructions', () => {
        expect(screen.getByRole('button', { name: 'I am ready to start this timed exam.' })).toBeInTheDocument();
      });

      it('keeps the unit hidden', () => {
        expect(queryUnitFrame()).not.toBeInTheDocument();
      });

      it('asks for the exam once', () => {
        expect(examRequests()).toHaveLength(1);
      });
    });

    describe('when the learner starts the exam', () => {
      beforeEach(async () => {
        course = renderExam({});
        await user.click(await screen.findByRole('button', { name: 'I am ready to start this timed exam.' }));
        await findUnitFrame();
      });

      it('creates the attempt with the clock started', () => {
        const post = course.specialExams.requests.find(({ method }) => method === 'POST');
        expect(post?.body).toEqual({ start_clock: 'true', attempt_proctored: 'false' });
        expect(course.specialExams.statusOf(course.sequenceId)).toBe('started');
      });

      it('shows the unit', () => {
        expect(unitFrame()).toBeInTheDocument();
      });

      it('shows the timer with the End My Exam button', () => {
        expect(timerText()).toBeInTheDocument();
        expect(endExamButton()).toBeInTheDocument();
      });

      it('asks for the exam again after the start', () => {
        expect(examRequests()).toHaveLength(2);
      });
    });

    describe('while the attempt is running', () => {
      it('turns the timer alert warning below 20% of the time limit', async () => {
        renderExam({ status: 'started', remainingSeconds: 300, exam: { time_limit_mins: 30 } });
        await findUnitFrame();
        await waitFor(() => expect(timerAlert()).toHaveClass('alert-warning'));
      });

      it('turns the timer alert danger below 5% of the time limit', async () => {
        renderExam({ status: 'started', remainingSeconds: 60, exam: { time_limit_mins: 30 } });
        await findUnitFrame();
        await waitFor(() => expect(timerAlert()).toHaveClass('alert-danger'));
      });
    });

    describe('when End My Exam is clicked', () => {
      beforeEach(async () => {
        course = renderExam({ status: 'started' });
        await findUnitFrame();
        await user.click(endExamButton());
        await screen.findByText('Are you sure that you want to submit your timed exam?');
      });

      it('stops the attempt', () => {
        expect(putActions()).toEqual(['stop']);
      });

      it('hides the unit', () => {
        expect(queryUnitFrame()).not.toBeInTheDocument();
      });

      it('keeps the timer without its End My Exam button', () => {
        expect(timerText()).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'End My Exam' })).not.toBeInTheDocument();
      });

      describe('and the learner continues working', () => {
        beforeEach(async () => {
          await user.click(screen.getByRole('button', { name: "No, I'd like to continue working" }));
          await findUnitFrame();
        });

        it('restarts the attempt', () => {
          expect(putActions()).toEqual(['stop', 'start']);
        });

        it('brings back the End My Exam button', () => {
          expect(endExamButton()).toBeInTheDocument();
        });
      });

      describe('and the learner submits', () => {
        beforeEach(async () => {
          await user.click(screen.getByRole('button', { name: 'Yes, submit my timed exam.' }));
          await screen.findByText('You have submitted your timed exam.');
        });

        it('submits the attempt', () => {
          expect(putActions()).toEqual(['stop', 'submit']);
        });

        it('removes the timer', () => {
          expect(screen.queryByText(/You are taking/)).not.toBeInTheDocument();
        });
      });
    });

    describe('when ready to submit with no time left', () => {
      it('hides the continue button on the submit page', async () => {
        renderExam({ status: 'ready_to_submit', remainingSeconds: 0 });
        await screen.findByText('Are you sure that you want to submit your timed exam?');
        expect(screen.queryByRole('button', { name: "No, I'd like to continue working" })).not.toBeInTheDocument();
      });
    });

    describe('past the due date', () => {
      describe('with no attempt', () => {
        it('shows the expired page', async () => {
          renderExam({ exam: { passed_due_date: true } });
          expect(await screen.findByText('The due date for this exam has passed')).toBeInTheDocument();
          expect(screen.queryByRole('button', { name: 'I am ready to start this timed exam.' })).not.toBeInTheDocument();
        });

        it('still offers the entrance for a practice exam', async () => {
          renderExam({ exam: { type: 'practice', passed_due_date: true } });
          expect(await screen.findByText('Try a proctored exam')).toBeInTheDocument();
        });
      });

      describe('with a submitted attempt', () => {
        it('shows the unit when the section stays visible after due', async () => {
          renderExam({ status: 'submitted', exam: { passed_due_date: true, hide_after_due: false } });
          expect(await findUnitFrame()).toBeInTheDocument();
          expect(screen.queryByText('You have submitted your timed exam.')).not.toBeInTheDocument();
        });

        it('shows the submitted page when the section is hidden after due', async () => {
          renderExam({ status: 'submitted', exam: { passed_due_date: true, hide_after_due: true } });
          expect(await screen.findByText('You have submitted your timed exam.')).toBeInTheDocument();
          expect(queryUnitFrame()).not.toBeInTheDocument();
        });

        it('shows the submitted page for a proctored exam even when the section stays visible', async () => {
          renderExam({ status: 'submitted', exam: { type: 'proctored', passed_due_date: true, hide_after_due: false } });
          expect(await screen.findByText('You have submitted this proctored exam for review')).toBeInTheDocument();
          expect(queryUnitFrame()).not.toBeInTheDocument();
        });
      });
    });

    describe('when time runs out', () => {
      beforeEach(async () => {
        jest.useFakeTimers({ now: new Date('2026-10-07T10:00:00Z') });
        course = renderExam({ status: 'started', remainingSeconds: 2 });
        await findUnitFrame();
        // The library holds the countdown at 00:00 for a 5 s grace period, then expires the attempt.
        await screen.findByText(OVERTIME_TITLE, {}, { timeout: 10_000 });
      });

      it('submits the exam itself', () => {
        expect(putActions()).toEqual(['submit']);
      });

      it('removes the timer', () => {
        expect(screen.queryByText(/You are taking/)).not.toBeInTheDocument();
      });
    });

    describe('when the running attempt belongs to a different sequence', () => {
      const otherSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@other';
      stubLocation();

      beforeEach(async () => {
        course = mockExamCourse({ sequence: { is_time_limited: false } });
        course.specialExams.setExam(otherSequenceId, {
          status: 'started', attempt: { exam_url_path: 'http://localhost/the-exam' },
        });
        renderSequence(course);
        await findUnitFrame();
        await user.click(await screen.findByRole('button', { name: 'End My Exam' }));
        await waitFor(() => expect(putActions()).toEqual(['stop']));
      });

      it('stops the attempt on End My Exam', () => {
        expect(course.specialExams.statusOf(otherSequenceId)).toBe('ready_to_submit');
      });

      it('leaves for the exam sequence', async () => {
        await waitFor(() => expect(locationStub.href).toBe('http://localhost/the-exam'));
      });
    });
  });

  describe('proctored exam', () => {
    const proctored = { type: 'proctored' };
    const legacyProctored = { type: 'proctored', use_legacy_attempt_api: true };
    const lti = { use_legacy_attempt_api: false };

    describe('with no attempt', () => {
      it('shows the proctored entrance without a skip button', async () => {
        renderExam({ exam: proctored });
        expect(await screen.findByText('This exam is proctored')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continue to my proctored exam.' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Take this exam without proctoring.' })).not.toBeInTheDocument();
      });

      it('shows the skip button when the sequence allows opting out (a flag the LMS never sends today, #2162)', async () => {
        renderExam({ exam: proctored }, { sequence: { allow_proctoring_opt_out: true } });
        expect(await screen.findByRole('button', { name: 'Take this exam without proctoring.' })).toBeInTheDocument();
      });

      it('shows the prerequisites page instead of the entrance when prerequisites are unmet', async () => {
        renderExam({
          exam: {
            ...proctored,
            prerequisite_status: {
              are_prerequisites_satisifed: false,
              satisfied_prerequisites: [],
              failed_prerequisites: [{
                namespace: 'proctoring', name: 'onboarding', display_name: 'Onboarding exam', status: 'failed',
              }],
              pending_prerequisites: [],
              declined_prerequisites: [],
            },
          },
        });
        expect(await screen.findByText('You did not satisfy the requirements for taking this exam with proctoring.')).toBeInTheDocument();
        expect(screen.getByText('Onboarding exam')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Continue to my proctored exam.' })).not.toBeInTheDocument();
      });
    });

    describe('with a created LTI attempt', () => {
      const settings = {
        provider_name: 'Mock Provider',
        provider_tech_support_url: 'https://example.com/support',
        provider_tech_support_email: 'support@example.com',
        provider_tech_support_phone: '555-0100',
      };

      beforeEach(async () => {
        course = renderExam({
          exam: proctored, status: 'created', attempt: lti, proctoringSettings: settings,
        });
        await screen.findByText('Set up and start your proctored exam.');
      });

      it('shows the provider support URL rather than the email and phone', () => {
        expect(screen.getByText(/by visiting/)).toHaveTextContent('https://example.com/support');
        expect(screen.queryByText(/by emailing/)).not.toBeInTheDocument();
      });

      it('shows the provider email and phone when there is no support URL', async () => {
        renderExam({
          exam: proctored, status: 'created', attempt: lti, proctoringSettings: { ...settings, provider_tech_support_url: '' },
        });
        expect(await screen.findByText(/by emailing/)).toHaveTextContent('support@example.com or by calling 555-0100');
      });

      describe('when Start System Check is clicked', () => {
        stubLocation();

        beforeEach(async () => {
          await user.click(screen.getByRole('button', { name: 'Start System Check' }));
          await waitFor(() => expect(putActions()).toEqual(['click_download_software']));
        });

        it('records the download click', () => {
          expect(course.specialExams.statusOf(course.sequenceId)).toBe('download_software_clicked');
        });

        it('leaves for the LTI launch', () => {
          expect(locationStub.assign).toHaveBeenCalledWith(`${EXAMS_BASE_URL}/lti/start_proctoring/1`);
        });
      });

      describe('when Start Exam is clicked before the system check passes', () => {
        beforeEach(async () => {
          await user.click(screen.getByRole('button', { name: 'Start Exam' }));
          await screen.findByText('You must complete the proctoring setup before you can start the exam.');
        });

        it('explains that setup is incomplete', () => {
          expect(screen.getByText('You must complete the proctoring setup before you can start the exam.')).toBeInTheDocument();
        });

        it('changes nothing on the attempt', () => {
          expect(putActions()).toEqual([]);
          expect(course.specialExams.statusOf(course.sequenceId)).toBe('created');
        });
      });
    });

    describe('with a created legacy REST attempt', () => {
      stubLocation();

      beforeEach(async () => {
        course = renderExam({
          exam: legacyProctored,
          status: 'created',
          attempt: { software_download_url: 'https://example.com/download' },
          proctoringSettings: {
            exam_proctoring_backend: {
              download_url: 'https://example.com/download', instructions: ['Install the software', 'Restart your browser'], name: 'rest', rules: {},
            },
            provider_tech_support_email: 'support@example.com',
            provider_tech_support_phone: '555-0100',
          },
        });
        await screen.findByText('Set up and start your proctored exam.');
      });

      it("shows the provider's own download steps", () => {
        expect(screen.getByText('Install the software')).toBeInTheDocument();
        expect(screen.getByText('Restart your browser')).toBeInTheDocument();
      });

      it('leaves for the provider download URL when Start System Check is clicked', async () => {
        await user.click(screen.getByRole('button', { name: 'Start System Check' }));
        await waitFor(() => expect(putActions()).toEqual(['click_download_software']));
        expect(locationStub.assign).toHaveBeenCalledWith('https://example.com/download');
      });
    });

    describe('after the download was clicked', () => {
      it('stays on the setup page', async () => {
        renderExam({ exam: proctored, status: 'download_software_clicked', attempt: lti });
        expect(await screen.findByText('Set up and start your proctored exam.')).toBeInTheDocument();
      });
    });

    describe('when ready to start', () => {
      beforeEach(async () => {
        course = renderExam({ exam: legacyProctored, status: 'ready_to_start', reviewPolicy: 'No notes, no calculators.' });
        await screen.findByText('You have 30 minutes to complete this exam.');
      });

      it('shows the review policy with the rules', async () => {
        expect(await screen.findByText('No notes, no calculators.')).toBeInTheDocument();
      });

      describe('and Start exam is clicked', () => {
        beforeEach(async () => {
          await user.click(screen.getByRole('button', { name: 'Start exam' }));
          await findUnitFrame();
        });

        it('starts the attempt', () => {
          expect(putActions()).toEqual(['start']);
        });

        it('shows the unit', () => {
          expect(unitFrame()).toBeInTheDocument();
        });
      });
    });

    describe('when ready to start on an LTI exam', () => {
      describe('with no proctoring app answering', () => {
        beforeEach(async () => {
          jest.useFakeTimers();
          course = renderExam({
            exam: proctored, status: 'ready_to_start', attempt: lti, proctoringSettings: { proctoring_escalation_email: 'escalate@example.com' },
          });
          await screen.findByText('You have 30 minutes to complete this exam.');
          await waitFor(() => expect(putActions()).toEqual(['error']), { timeout: 10_000 });
        });

        it('ends the attempt in error after 5 s', () => {
          expect(course.specialExams.statusOf(course.sequenceId)).toBe('error');
        });

        it('shows that the proctoring application was not detected', async () => {
          expect(await screen.findByText('Something has gone wrong with your exam. Proctoring application not detected.')).toBeInTheDocument();
        });

        it('shows the error instructions', async () => {
          expect(await screen.findByText('Error with proctored exam')).toBeInTheDocument();
        });
      });

      describe('with the proctoring app replying from the exams origin', () => {
        // jsdom's postMessage never sets event.origin, which the library checks against EXAMS_BASE_URL.
        let replied = false;
        const reply = (event: MessageEvent) => {
          if (Array.isArray(event.data) && event.data[0] === 'proctorio_status') {
            replied = true;
            window.dispatchEvent(new MessageEvent('message', { data: { active: true }, origin: EXAMS_BASE_URL }));
          }
        };

        beforeEach(async () => {
          jest.useFakeTimers();
          replied = false;
          window.addEventListener('message', reply);
          course = renderExam({ exam: proctored, status: 'ready_to_start', attempt: lti });
          await screen.findByText('You have 30 minutes to complete this exam.');
          // jsdom delivers postMessage on a real timer; let the probe be answered before the 5 s fake timeout runs
          await waitFor(() => expect(replied).toBe(true));
          jest.advanceTimersByTime(6_000);
        });

        afterEach(() => {
          window.removeEventListener('message', reply);
        });

        it('stays on the page', async () => {
          await waitFor(() => expect(screen.getByText('You have 30 minutes to complete this exam.')).toBeInTheDocument());
        });

        it('leaves the attempt as it was', () => {
          expect(putActions()).toEqual([]);
          expect(course.specialExams.statusOf(course.sequenceId)).toBe('ready_to_start');
        });
      });
    });

    describe('when ready to submit', () => {
      beforeEach(async () => {
        renderExam({ exam: legacyProctored, status: 'ready_to_submit' });
        await screen.findByText('Are you sure you want to end your proctored exam?');
      });

      it('offers to continue working', () => {
        expect(screen.getByRole('button', { name: "No, I'd like to continue working" })).toBeInTheDocument();
      });

      it('offers to end the exam', () => {
        expect(screen.getByRole('button', { name: 'Yes, end my proctored exam' })).toBeInTheDocument();
      });
    });

    describe('after submission', () => {
      it.each(['submitted', 'second_review_required'])('shows the submitted-for-review page for a %s attempt', async (status) => {
        renderExam({ exam: legacyProctored, status });
        expect(await screen.findByText('You have submitted this proctored exam for review')).toBeInTheDocument();
      });
    });

    describe('with a verified attempt', () => {
      it.each([
        ['proctored', /Your proctoring session was reviewed successfully/],
        ['practice', /Your proctoring session was reviewed successfully/],
        ['onboarding', 'Your onboarding profile was reviewed successfully'],
      ])('shows the verified page for a %s exam', async (type, text) => {
        renderExam({ exam: { type, use_legacy_attempt_api: true }, status: 'verified' });
        expect(await screen.findByText(text)).toBeInTheDocument();
      });
    });

    describe('with a rejected attempt', () => {
      it('shows the rejected page with the course-team footer line for a proctored exam', async () => {
        renderExam({ exam: legacyProctored, status: 'rejected' });
        expect(await screen.findByText('Your proctoring session was reviewed, but did not pass all requirements')).toBeInTheDocument();
        expect(screen.getByText(/contact your course team/)).toBeInTheDocument();
      });

      it('shows the rejected page without the footer line for a practice exam', async () => {
        renderExam({ exam: { type: 'practice', use_legacy_attempt_api: true }, status: 'rejected' });
        expect(await screen.findByText('Your proctoring session was reviewed, but did not pass all requirements')).toBeInTheDocument();
        expect(screen.queryByText(/contact your course team/)).not.toBeInTheDocument();
      });
    });

    describe('with an errored attempt', () => {
      it('shows the escalation email for a proctored exam', async () => {
        renderExam({ exam: legacyProctored, status: 'error', proctoringSettings: { proctoring_escalation_email: 'escalate@example.com' } });
        expect(await screen.findByText('Error with proctored exam')).toBeInTheDocument();
        expect(screen.getByText(/escalate@example\.com/)).toBeInTheDocument();
      });

      describe('when a practice exam is retried', () => {
        beforeEach(async () => {
          course = renderExam({ exam: { type: 'practice', use_legacy_attempt_api: true }, status: 'error' });
          await screen.findByText('There was a problem with your practice proctoring session');
          await user.click(screen.getByRole('button', { name: 'Retry my exam' }));
          await screen.findByText('Try a proctored exam');
        });

        it('resets the attempt', () => {
          expect(putActions()).toEqual(['reset_attempt']);
          expect(course.specialExams.statusOf(course.sequenceId)).toBeNull();
        });

        it('returns to the entrance', () => {
          expect(screen.getByText('Try a proctored exam')).toBeInTheDocument();
        });
      });
    });

    describe('with an onboarding status', () => {
      it.each(['onboarding_missing', 'onboarding_pending', 'onboarding_failed', 'onboarding_expired'])(
        'shows the onboarding error page for %s',
        async (status) => {
          renderExam({ exam: legacyProctored, status });
          expect(await screen.findByText('You must complete an onboarding exam before taking this proctored exam')).toBeInTheDocument();
        },
      );
    });

    describe('for a learner whose enrollment cannot take proctored exams', () => {
      it('refuses the exam instead of showing the entrance', async () => {
        renderExam({ exam: proctored }, { courseMetadata: { can_access_proctored_exams: false } });
        expect(await screen.findByText('You do not have access to proctored exams with your current enrollment.')).toBeInTheDocument();
        expect(screen.queryByText('This exam is proctored')).not.toBeInTheDocument();
      });
    });

    describe('with an unknown attempt status', () => {
      it('shows the generic error page', async () => {
        renderExam({ exam: legacyProctored, status: 'nonsense' });
        expect(await screen.findByText(
          'A system error has occurred with your exam. Please reach out to support for assistance.',
        )).toBeInTheDocument();
      });
    });
  });

  describe('exam access token on the unit', () => {
    describe('on edx-exams', () => {
      beforeEach(async () => {
        course = renderExam({ status: 'started', accessToken: { exam_access_token: 'TOKEN-123' } });
        await findUnitFrame();
      });

      it('requests the token once', () => {
        expect(tokenRequests()).toHaveLength(1);
      });

      it('puts the token on the unit iframe URL', () => {
        expect(examAccessParam()).toBe('TOKEN-123');
      });
    });

    describe('without EXAMS_BASE_URL', () => {
      beforeEach(async () => {
        mergeConfig({ EXAMS_BASE_URL: '' });
        course = renderExam({ status: 'started' });
        await findUnitFrame();
      });

      it('requests no token', () => {
        expect(tokenRequests()).toHaveLength(0);
      });

      it('leaves exam_access empty on the unit iframe URL', () => {
        expect(examAccessParam()).toBe('');
      });
    });

    describe('when the token request fails', () => {
      beforeEach(async () => {
        renderExam({ status: 'started', failTokenGet: true });
        await findUnitFrame();
      });

      it('still shows the unit', () => {
        expect(unitFrame()).toBeInTheDocument();
      });

      it('leaves exam_access empty on the unit iframe URL', () => {
        expect(examAccessParam()).toBe('');
      });
    });
  });

  describe('who is looking', () => {
    describe('as staff', () => {
      beforeEach(async () => {
        renderExam({}, { courseHomeMetadata: { is_staff: true } });
        await findUnitFrame();
      });

      it('shows the unit', () => {
        expect(unitFrame()).toBeInTheDocument();
      });

      it('shows no instructions and no timer', () => {
        expect(screen.queryByText('Subsection is a Timed Exam (30 minutes)')).not.toBeInTheDocument();
        expect(screen.queryByText(/You are taking/)).not.toBeInTheDocument();
      });
    });

    describe('as staff masquerading as a learner with no attempt', () => {
      beforeEach(async () => {
        renderExam({}, { courseHomeMetadata: { is_staff: false, original_user_is_staff: true } });
        await screen.findByText('This exam is hidden from the learner.');
      });

      it('shows the hidden-from-the-learner alert', () => {
        expect(screen.getByText('This exam is hidden from the learner.')).toBeInTheDocument();
      });

      it('shows the unit behind it', async () => {
        expect(await findUnitFrame()).toBeInTheDocument();
      });
    });

    describe('on a gated exam sequence', () => {
      it('shows no exam instructions', async () => {
        renderExam({}, {
          sequence: {
            gated_content: {
              gated: true, prereq_id: 'prereq', prereq_section_name: 'Prereq', gated_section_name: 'Exam',
            },
          },
        });
        await waitFor(() => expect(screen.queryByText('Loading learning sequence...')).not.toBeInTheDocument());
        expect(screen.queryByText('Subsection is a Timed Exam (30 minutes)')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'I am ready to start this timed exam.' })).not.toBeInTheDocument();
      });
    });
  });

  describe('when the exam request fails', () => {
    it('shows the API error alert on an exam sequence, headed with the error message verbatim', async () => {
      renderExam({ failExamGet: true });
      const alert = await screen.findByRole('alert');
      expect(within(alert).getByText('Request failed with status code 500')).toBeInTheDocument();
    });

    it('shows no alert on a sequence that is not an exam', async () => {
      course = mockExamCourse({ sequence: { is_time_limited: false } });
      course.specialExams.setExam(course.sequenceId, { failExamGet: true });
      renderSequence(course);
      expect(await findUnitFrame()).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('on a sequence that is not an exam', () => {
    beforeEach(async () => {
      course = mockExamCourse({ sequence: { is_time_limited: false } });
      renderSequence(course);
      await findUnitFrame();
    });

    it('shows the unit', () => {
      expect(unitFrame()).toBeInTheDocument();
    });

    it('asks for the latest attempt once and never for the exam', () => {
      expect(examRequests()).toHaveLength(0);
      expect(latestAttemptRequests()).toHaveLength(1);
    });
  });
});
