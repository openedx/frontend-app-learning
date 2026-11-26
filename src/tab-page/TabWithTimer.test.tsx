import { getAppConfig, mergeAppConfig } from '@openedx/frontend-base';
import {
  act, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { appId } from '@src/constants';
import { mockCourseRequests } from '@src/tests/courseware';
import { mockLocation } from '@src/tests/location';
import { render } from '@src/tests/render';

import TabWithTimer from './TabWithTimer';

const EXAMS_BASE_URL = 'http://localhost:18740';
const EXAM_SEQUENCE_ID = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@exam';
const originalExamsBaseUrl = getAppConfig(appId).EXAMS_BASE_URL;

// A tab hands TabPage its metadata query, as OutlineTab does.
const Tab = ({ courseId }: { courseId: string }) => {
  const metadataQuery = useCourseHomeMeta(courseId);
  return (
    <TabWithTimer courseId={courseId} courseStatus={{ metadataQuery }}>
      <div>tab body</div>
    </TabWithTimer>
  );
};

type Course = ReturnType<typeof mockCourseRequests>;
let course: Course;

const latestAttemptRequests = () => course.specialExams.requests
  .filter(({ url }) => /\/exams\/attempt\/latest$|\/proctored_exam\/attempt\/course_id\/[^?]+\?is_learning_mfe=true$/.test(url));
const putActions = () => course.specialExams.requests
  .filter(({ method }) => method === 'PUT').map(({ body }) => body?.action);

const renderTab = (rendered: Course) => {
  course = rendered;
  // No params provider: the frame needs none.
  return render(<Tab courseId={course.courseId} />, { wrapWithRouter: true });
};

describe('TabWithTimer', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    mergeAppConfig(appId, { EXAMS_BASE_URL });
    user = userEvent.setup();
  });

  afterEach(() => {
    act(() => mergeAppConfig(appId, { EXAMS_BASE_URL: originalExamsBaseUrl }));
  });

  describe('with a running attempt', () => {
    // jsdom cannot navigate; the library writes `location.href` to leave for the exam.
    let location: { href: string };

    beforeEach(async () => {
      location = mockLocation({ href: window.location.href });
      const running = mockCourseRequests();
      running.specialExams.setExam(EXAM_SEQUENCE_ID, {
        status: 'started', exam: { exam_name: 'Final' }, attempt: { exam_url_path: 'http://localhost/the-exam' },
      });
      renderTab(running);
      await screen.findByText(/You are taking/);
    });

    it('shows the timer', () => {
      const timer = screen.getByText(/You are taking/).closest('[role="alert"]') as HTMLElement;
      expect(within(timer).getByRole('link', { name: 'Final' })).toBeInTheDocument();
      expect(within(timer).getByRole('button', { name: 'End My Exam' })).toBeInTheDocument();
      expect(screen.getByText('tab body')).toBeInTheDocument();
    });

    it('asks for the latest attempt once', () => {
      expect(latestAttemptRequests()).toHaveLength(1);
    });

    it('stops the attempt and leaves for the exam sequence on End My Exam', async () => {
      await user.click(screen.getByRole('button', { name: 'End My Exam' }));
      await waitFor(() => expect(putActions()).toEqual(['stop']));
      await waitFor(() => expect(location.href).toBe('http://localhost/the-exam'));
    });
  });

  describe('with no attempt', () => {
    beforeEach(async () => {
      renderTab(mockCourseRequests());
      await screen.findByText('tab body');
      await waitFor(() => expect(latestAttemptRequests()).toHaveLength(1));
    });

    it('shows no timer', () => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('asks for the latest attempt once', () => {
      expect(latestAttemptRequests()).toHaveLength(1);
    });
  });

  it('shows the API error alert when the latest-attempt request fails', async () => {
    const failing = mockCourseRequests();
    failing.specialExams.setExam(EXAM_SEQUENCE_ID, { failLatestGet: true });
    renderTab(failing);

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('Request failed with status code 500')).toBeInTheDocument();
    expect(screen.getByText('tab body')).toBeInTheDocument();
  });

  it('asks the LMS course-level endpoint for the latest attempt on the legacy family', async () => {
    mergeAppConfig(appId, { EXAMS_BASE_URL: '' });
    const legacy = mockCourseRequests();
    legacy.specialExams.setExam(EXAM_SEQUENCE_ID, { status: 'started' });
    renderTab(legacy);

    expect(await screen.findByText(/You are taking/)).toBeInTheDocument();
    expect(latestAttemptRequests()).toHaveLength(1);
    expect(latestAttemptRequests()[0].url).toContain('/api/edx_proctoring/v1/proctored_exam/attempt/course_id/');
  });
});
