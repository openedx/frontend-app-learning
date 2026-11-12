import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { type ReactElement, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';

import { useOutlineTabData } from '@src/course-home/data/apiHooks';
import { AlertList } from '@src/generic/user-messages';
import { createTestQueryClient } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import useCertificateStatusAlert from './alerts/certificate-status-alert';
import CertificateStatusAlert from './alerts/certificate-status-alert/CertificateStatusAlert';
import CourseEndAlert from './alerts/course-end-alert/CourseEndAlert';
import PrivateCourseAlert from './alerts/private-course-alert/PrivateCourseAlert';
import LmsHtmlFragment from './LmsHtmlFragment';
import CourseHandouts from './widgets/CourseHandouts';
import WeeklyLearningGoalCard from './widgets/WeeklyLearningGoalCard';

// Each case renders one component on its own, in a state the tab never gives it: the tab renders
// its content only once the course metadata and the outline have both loaded.

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const outlineUrl = `${getSiteConfig().lmsBaseUrl}/api/course_home/outline/${courseId}`;

const onOutlinePath = (ui: ReactNode) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <MemoryRouter initialEntries={[`/course/${courseId}/home`]}>
      <Routes>
        <Route path="/course/:courseId/home" element={ui} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

// Renders on the outline path with no course metadata and no outline in the query cache.
const renderWithoutData = (ui: ReactElement) => render(onOutlinePath(ui));

const WhenOutlineLoads = ({ children }: { children: ReactNode }) => (
  useOutlineTabData(courseId).isSuccess ? children : null
);

// Renders on the outline path with the outline loaded and no course metadata.
const renderWithOutlineData = (ui: ReactElement, tabData = {}) => {
  new MockAdapter(getAuthenticatedHttpClient()).onGet(outlineUrl).reply(200, Factory.build('outlineTabData', tabData));
  return render(onOutlinePath(<WhenOutlineLoads>{ui}</WhenOutlineLoads>));
};

describe('CertificateStatusAlert', () => {
  it('renders an empty alert for a status it does not know when the learner is not failing an ended course', () => {
    renderWithoutData(<CertificateStatusAlert payload={{ certStatus: 'audit_passing', notPassingCourseEnded: false }} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/^$/);
  });

  it('renders the earned-not-available dates when the payload carries a time zone', () => {
    renderWithoutData(
      <CertificateStatusAlert
        payload={{
          certStatus: 'earned_but_not_available',
          certificateAvailableDate: '2030-06-02T12:00:00Z',
          courseEndDate: '2030-06-01T12:00:00Z',
          userTimezone: 'UTC',
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'This course ends on June 1, 2030. Final grades and any earned certificates are scheduled to be available after June 2, 2030.',
    );
  });
});

describe('useCertificateStatusAlert', () => {
  const Alerts = () => (
    <AlertList topic="outline-course-alerts" customAlerts={useCertificateStatusAlert(courseId)} />
  );

  it('shows no alert without course metadata, which carries the enrollment', async () => {
    const { container } = renderWithOutlineData(<><Alerts /><p>loaded</p></>, {
      cert_data: { cert_status: 'downloadable', cert_web_view_url: 'certificate/testuuid' },
    });

    expect(await screen.findByText('loaded')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });
});

describe('CourseEndAlert', () => {
  it('formats the end date in the time zone the payload carries', () => {
    const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString();
    renderWithoutData(<CourseEndAlert payload={{ endDate, userTimezone: 'UTC', description: 'Final exam week.' }} />);

    const courseEndDate = new Intl.DateTimeFormat('en', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(endDate));
    expect(screen.getByRole('alert')).toHaveTextContent(`This course is ending in 5 days on ${courseEndDate}.Final exam week.`);
  });
});

describe('PrivateCourseAlert', () => {
  it('welcomes an authenticated learner without a course title when the course metadata is not loaded', () => {
    renderWithoutData(<PrivateCourseAlert payload={{ anonymousUser: false, canEnroll: true, courseId }} />);

    const alert = screen.getByTestId('private-course-alert');
    expect(alert).toHaveTextContent(/^Welcome to Enroll now to access the full course\.$/);
  });
});

describe('CourseHandouts', () => {
  it('renders nothing when the outline is not loaded', () => {
    const { container } = renderWithoutData(<CourseHandouts />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('WeeklyLearningGoalCard', () => {
  it('renders with no goal selected and reminders off when it is given neither, without course metadata', () => {
    renderWithoutData(<WeeklyLearningGoalCard />);

    ['Casual', 'Regular', 'Intense'].forEach((level) => {
      expect(screen.getByTestId(`weekly-learning-goal-input-${level}`)).toHaveAttribute('aria-checked', 'false');
    });
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});

describe('LmsHtmlFragment', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('dir');
  });

  it('gives the frame document an empty body class when it is given none', () => {
    render(<LmsHtmlFragment html="<p>Text</p>" title="Frame" />);

    expect((screen.getByTitle('Frame') as HTMLIFrameElement).srcdoc).toContain('<body class=""><p>Text</p></body>');
  });

  it.each([
    [null, 'ltr'],
    ['rtl', 'rtl'],
  ])('takes the frame document direction from the page: dir %s gives %s', (pageDirection, frameDirection) => {
    if (pageDirection) {
      document.documentElement.setAttribute('dir', pageDirection);
    } else {
      document.documentElement.removeAttribute('dir');
    }
    render(<LmsHtmlFragment html="<p>Text</p>" title="Frame" />);

    expect((screen.getByTitle('Frame') as HTMLIFrameElement).srcdoc).toContain(`<html dir="${frameDirection}">`);
  });
});
