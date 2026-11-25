import { getAppConfig, getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { appId } from '@src/constants';
import DatesTab from '@src/course-home/dates-tab';
import LiveTab from '@src/course-home/live-tab/LiveTab';
import OutlineTab from '@src/course-home/outline-tab';
import ProgressTab from '@src/course-home/progress-tab/ProgressTab';
import CoursewareContainer from '@src/courseware';
import { mockCourseRequests } from '@src/tests/courseware';
import { renderStandalone } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

/*
 * Each tab root brings its own context: rendered with only the shell's providers (no Main, no Learning route), it
 * renders its content instead of throwing for a missing provider. The full standalone tests are the widgets'.
 */
describe('tab roots on their own', () => {
  const { lmsBaseUrl } = getSiteConfig();
  let axiosMock: MockAdapter;
  let courseId: string;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const metadata = Factory.build('courseHomeMetadata');
    courseId = metadata.id;
    axiosMock.onGet(appendBrowserTimezoneToUrl(`${lmsBaseUrl}/api/course_home/course_metadata/${courseId}`))
      .reply(200, metadata);
  });

  it('renders the outline', async () => {
    axiosMock.onGet(`${lmsBaseUrl}/api/course_home/outline/${courseId}`).reply(200, Factory.build('outlineTabData'));
    axiosMock.onGet(
      `${getAppConfig(appId).EXAMS_BASE_URL}/api/v1/student/course_id/${encodeURIComponent(courseId)}/onboarding?username=MockUser`,
    ).reply(200, { onboarding_status: 'created', onboarding_link: 'test', expiration_date: null });
    renderStandalone(<OutlineTab courseId={courseId} />);

    // The account activation modal can hide the page behind it from the accessibility tree.
    expect(await screen.findByRole('heading', { level: 1, hidden: true })).toHaveTextContent('Demonstration Course');
    // The alerts the outline passes the frame need its user messages; they load lazily.
    expect(await screen.findByTestId('private-course-alert')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('renders the dates', async () => {
    axiosMock.onGet(`${lmsBaseUrl}/api/course_home/dates/${courseId}`).reply(200, Factory.build('datesTabData'));
    renderStandalone(<DatesTab courseId={courseId} />);

    expect(await screen.findByRole('heading', { name: 'Important dates' })).toBeInTheDocument();
  });

  it('renders the progress', async () => {
    axiosMock.onGet(new RegExp(`${lmsBaseUrl}/api/course_home/progress/*`)).reply(200, Factory.build('progressTabData'));
    renderStandalone(<ProgressTab courseId={courseId} />);

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Your progress');
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('renders the live tab', async () => {
    axiosMock.onGet(`${lmsBaseUrl}/api/course_live/iframe/${courseId}/`)
      .reply(200, { iframe: '<iframe id="lti-tab-embed" title="live-embed"></iframe>' });
    renderStandalone(<LiveTab courseId={courseId} />);

    expect(await screen.findByTitle('live-embed')).toBeInTheDocument();
  });

  it('renders the courseware', async () => {
    // The sequence scrolls to the top on load, which jsdom does not implement.
    global.scrollTo = jest.fn();
    axiosMock.restore();
    const course = mockCourseRequests();
    renderStandalone(
      <CoursewareContainer courseId={course.courseId} sequenceId={course.sequenceId} unitId={course.unitId} />,
    );

    expect(await screen.findByTitle(course.unitBlocks[0].display_name)).toBeInTheDocument();
  });
});
