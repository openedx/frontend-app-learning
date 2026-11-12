import { QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';

import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { AlertList } from '@src/generic/user-messages';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import CourseStartMasqueradeBanner from './CourseStartMasqueradeBanner';
import useCourseStartAlert, { useCourseStartMasqueradeBanner } from './index';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const fromNow = (milliseconds: number) => new Date(Date.now() + milliseconds).toISOString();
const formatDate = (date: string, options: Intl.DateTimeFormatOptions) => (
  new Intl.DateTimeFormat('en', { timeZone: 'UTC', ...options }).format(new Date(date))
);

const Alerts = ({ tab }: { tab?: string }) => {
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseStartMasqueradeBanner = useCourseStartMasqueradeBanner(courseId, tab);
  return (
    <>
      <AlertList topic="outline-course-alerts" customAlerts={courseStartAlert} />
      <AlertList topic="instructor-toolbar-alerts" customAlerts={courseStartMasqueradeBanner} />
    </>
  );
};

const renderAlerts = (metadata: Record<string, unknown>, tab?: string) => {
  const queryClient = createTestQueryClient();
  seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, { userTimezone: 'UTC', ...metadata });
  return render(
    <QueryClientProvider client={queryClient}>
      <Alerts tab={tab} />
    </QueryClientProvider>,
  );
};

describe('useCourseStartAlert', () => {
  it('gives an enrolled learner the start date of a course more than a day away', async () => {
    const start = fromNow(7 * DAY_MS + HOUR_MS);
    renderAlerts({ isEnrolled: true, start });

    const alert = await screen.findByRole('alert');
    const startDate = formatDate(start, { day: 'numeric', month: 'short', year: 'numeric' });
    expect(alert).toHaveTextContent(`Course starts in 7 days on ${startDate}.`);
    expect(alert).toHaveTextContent('Don’t forget to add a calendar reminder!');
  });

  it('gives an enrolled learner the start time of a course less than a day away', async () => {
    const start = fromNow(2 * HOUR_MS + 60 * 1000);
    renderAlerts({ isEnrolled: true, start });

    const alert = await screen.findByRole('alert');
    const startTime = formatDate(start, {
      day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short',
    });
    expect(alert).toHaveTextContent(`Course starts in 2 hours at ${startTime}.`);
    expect(alert).not.toHaveTextContent('calendar reminder');
  });

  it('formats the date in the browser time zone when the learner has set none', async () => {
    const start = fromNow(7 * DAY_MS + HOUR_MS);
    renderAlerts({ isEnrolled: true, start, userTimezone: null });

    expect(await screen.findByRole('alert')).toHaveTextContent(/^Course starts in 7 days on .+\./);
  });

  it('shows nothing to a learner who is not enrolled', () => {
    const { container } = renderAlerts({ isEnrolled: false, start: fromNow(7 * DAY_MS) });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing once the course has started', () => {
    const { container } = renderAlerts({ isEnrolled: true, start: fromNow(-DAY_MS) });

    expect(container).toBeEmptyDOMElement();
  });
});

describe('useCourseStartMasqueradeBanner', () => {
  it('tells staff on the progress tab that the masqueraded learner has no access before the start date', async () => {
    const start = fromNow(7 * DAY_MS);
    renderAlerts({ isMasquerading: true, start }, 'progress');

    const startDate = formatDate(start, { day: 'numeric', month: 'numeric', year: 'numeric' });
    expect(await screen.findByText(/This learner does not yet have access to this course\./))
      .toHaveTextContent(`The course starts on ${startDate}.`);
  });

  it('formats the date in the browser time zone when the learner has set none', async () => {
    renderAlerts({ isMasquerading: true, start: fromNow(7 * DAY_MS), userTimezone: null }, 'progress');

    expect(await screen.findByText(/The course starts on .+\./)).toBeInTheDocument();
  });

  it('gives today as the start date when the course metadata is gone from the cache', () => {
    const { container } = render(<CourseStartMasqueradeBanner payload={{ courseId }} />);

    const today = new Intl.DateTimeFormat('en').format(new Date());
    expect(container).toHaveTextContent(`The course starts on ${today}.`);
  });

  it('shows nothing on another tab', () => {
    const { container } = renderAlerts({ isMasquerading: true, start: fromNow(7 * DAY_MS) }, 'outline');

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing when staff are not masquerading', () => {
    const { container } = renderAlerts({ isMasquerading: false, start: fromNow(7 * DAY_MS) }, 'progress');

    expect(container).toBeEmptyDOMElement();
  });
});
