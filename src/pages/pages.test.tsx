import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import {
  useCourseId, useIsPreview, useSequenceId, useTargetUserId, useUnitId,
} from '@src/generic/course-params';
import routes from '@src/routes';
import { renderRoutes } from '@src/tests/render';
import { appendBrowserTimezoneToUrl } from '@src/utils';

// Each page's component stands in for itself here: it shows the props the page gave it, or, for the two pages that
// pass their params through the provider, what the hooks read.
const mockProps = (name: string) => function Probe(props: object) {
  return <pre data-testid={name}>{JSON.stringify(props)}</pre>;
};
const mockHooks = (name: string) => function Probe() {
  const params = {
    courseId: useCourseId(),
    sequenceId: useSequenceId(),
    unitId: useUnitId(),
    targetUserId: useTargetUserId(),
    isPreview: useIsPreview(),
  };
  return <pre data-testid={name}>{JSON.stringify(params)}</pre>;
};

jest.mock('@src/course-home/outline-tab', () => mockProps('outline'));
jest.mock('@src/course-home/dates-tab', () => mockProps('dates'));
jest.mock('@src/course-home/progress-tab/ProgressTab', () => mockProps('progress'));
jest.mock('@src/course-home/live-tab/LiveTab', () => mockProps('live'));
jest.mock('@src/courseware', () => mockProps('courseware'));
jest.mock('@src/courseware/course/course-exit', () => ({ CourseExit: mockHooks('courseExit') }));
jest.mock('@src/generic/CourseAccessErrorPage', () => mockHooks('accessDenied'));

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const twiceEncodedCourseId = encodeURIComponent(encodeURIComponent(courseId));
const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic';
const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';
const courseMetadataUrl = appendBrowserTimezoneToUrl(
  `${getSiteConfig().lmsBaseUrl}/api/course_home/course_metadata/${courseId}`,
);

let axiosMock: MockAdapter;
const setMetadata = (attributes = {}) => {
  axiosMock.onGet(courseMetadataUrl).reply(200, Factory.build('courseHomeMetadata', attributes));
};

beforeEach(() => {
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  setMetadata();
});

// Renders the route and waits for the page's metadata request to settle, so nothing lands after the test.
const renderSettled = async (path: string) => {
  const rendered = renderRoutes(routes, path);
  await waitFor(() => expect(axiosMock.history.get.length).toBeGreaterThan(0));
  await waitFor(() => expect(rendered.queryClient.isFetching()).toBe(0));
  return rendered;
};

const renderedWith = async (name: string, path: string) => {
  const { queryClient } = renderRoutes(routes, path);
  const probe = await screen.findByTestId(name);
  await waitFor(() => expect(queryClient.isFetching()).toBe(0));
  return JSON.parse(probe.textContent!);
};

describe('route pages', () => {
  it.each([
    ['outline', 'home'],
    ['dates', 'dates'],
    ['live', 'live'],
  ])('the %s page passes the course id', async (name, segment) => {
    expect(await renderedWith(name, `/learning/course/${courseId}/${segment}`)).toEqual({ courseId });
  });

  it.each([
    ['outline', 'home'],
    ['dates', 'dates'],
    ['progress', 'progress'],
    ['live', 'live'],
    ['courseware', sequenceId],
    ['courseExit', 'course-end'],
    ['accessDenied', 'access-denied'],
  ])('the %s page passes a twice-encoded course id decoded', async (name, segment) => {
    const params = await renderedWith(name, `/learning/course/${twiceEncodedCourseId}/${segment}`);

    expect(params.courseId).toBe(courseId);
  });

  it('the progress page passes the course id', async () => {
    expect(await renderedWith('progress', `/learning/course/${courseId}/progress`)).toEqual({ courseId });
  });

  it('the progress page passes the learner to show', async () => {
    expect(await renderedWith('progress', `/learning/course/${courseId}/progress/42`))
      .toEqual({ courseId, targetUserId: '42' });
  });

  it.each([
    ['the course root', '', {}],
    ['a sequence', `/${sequenceId}`, { sequenceId }],
    ['a unit', `/${sequenceId}/${unitId}`, { sequenceId, unitId }],
  ])('the courseware page passes the ids at %s, not previewing', async (_name, ids, expected) => {
    expect(await renderedWith('courseware', `/learning/course/${courseId}${ids}`))
      .toEqual({ courseId, isPreview: false, ...expected });
  });

  it.each([
    ['a sequence', `/${sequenceId}`, { sequenceId }],
    ['a unit', `/${sequenceId}/${unitId}`, { sequenceId, unitId }],
  ])('the courseware page previews at %s on the preview routes', async (_name, ids, expected) => {
    expect(await renderedWith('courseware', `/learning/preview/course/${courseId}${ids}`))
      .toEqual({ courseId, isPreview: true, ...expected });
  });

  it.each([
    ['courseExit', 'course-end'],
    ['accessDenied', 'access-denied'],
  ])('the %s page provides the course id to the hooks', async (name, segment) => {
    expect(await renderedWith(name, `/learning/course/${courseId}/${segment}`)).toEqual({ courseId, isPreview: false });
  });
});

// The pages with a tab in them: each sets the title and sends a denied learner on, from the course metadata alone.
const tabPages = [
  ['outline', 'home', 'Course | Demonstration Course | Learning Test Site'],
  ['dates', 'dates', 'Dates | Demonstration Course | Learning Test Site'],
  ['progress', 'progress', 'Progress | Demonstration Course | Learning Test Site'],
  ['live', 'live', 'Demonstration Course | Learning Test Site'],
  ['courseware', sequenceId, 'Course | Demonstration Course | Learning Test Site'],
  ['courseExit', 'course-end', 'Course | Demonstration Course | Learning Test Site'],
];

describe('tab page title', () => {
  it.each(tabPages)('the %s page names the tab, the course and the site', async (name, segment, title) => {
    await renderedWith(name, `/learning/course/${courseId}/${segment}`);

    await waitFor(() => expect(document.title).toBe(title));
  });

  it('keeps the fallback title while the course metadata loads', async () => {
    axiosMock.onGet(courseMetadataUrl).reply(() => new Promise(() => {}));
    renderRoutes(routes, `/learning/course/${courseId}/dates`);

    // The tab renders meanwhile.
    expect(await screen.findByTestId('dates')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Learning | Learning Test Site'));
  });
});

describe('tab page access-denied redirect', () => {
  it.each(tabPages)('the %s page sends a learner denied for another enterprise to the access-denied page', async (name, segment) => {
    setMetadata({ course_access: { has_access: false, error_code: 'incorrect_active_enterprise' } });
    const { router } = await renderSettled(`/learning/course/${courseId}/${segment}`);

    await waitFor(() => expect(router.state.location.pathname).toBe(`/learning/course/${courseId}/access-denied`));
    expect(await screen.findByTestId('accessDenied')).toBeInTheDocument();
    expect(screen.queryByTestId(name)).not.toBeInTheDocument();
  });

  it.each(tabPages.filter(([name]) => name !== 'outline'))('the %s page sends an unenrolled learner to the outline', async (name, segment) => {
    setMetadata({ course_access: { has_access: false, error_code: 'enrollment_required' } });
    const { router } = await renderSettled(`/learning/course/${courseId}/${segment}`);

    await waitFor(() => expect(router.state.location.pathname).toBe(`/learning/course/${courseId}/home`));
    expect(await screen.findByTestId('outline')).toBeInTheDocument();
    expect(screen.queryByTestId(name)).not.toBeInTheDocument();
  });

  it('the outline page shows an unenrolled learner the outline', async () => {
    setMetadata({ course_access: { has_access: false, error_code: 'enrollment_required' } });
    const { router } = await renderSettled(`/learning/course/${courseId}/home`);

    expect(await screen.findByTestId('outline')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(`/learning/course/${courseId}/home`);
  });

  it('renders the tab while the course metadata loads, then redirects', async () => {
    let respond: (value: [number, object]) => void = () => {};
    axiosMock.onGet(courseMetadataUrl).reply(() => new Promise((resolve) => {
      respond = resolve;
    }));
    const { router } = renderRoutes(routes, `/learning/course/${courseId}/dates`);

    expect(await screen.findByTestId('dates')).toBeInTheDocument();

    respond([200, Factory.build('courseHomeMetadata', { course_access: { has_access: false, error_code: 'enrollment_required' } })]);
    await waitFor(() => expect(router.state.location.pathname).toBe(`/learning/course/${courseId}/home`));
    expect(await screen.findByTestId('outline')).toBeInTheDocument();
  });
});
