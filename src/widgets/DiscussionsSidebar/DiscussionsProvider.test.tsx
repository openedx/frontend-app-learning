import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import { discussionsSidebarRole } from '@src/constants';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import { discussionTopicsQuery } from '@src/courseware/data/apiHooks';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import { addExternalRoute } from '@src/tests/slots';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const { lmsBaseUrl } = getSiteConfig();
const configUrl = `${lmsBaseUrl}/api/discussion/v1/courses/${courseId}`;
const topicsUrl = `${lmsBaseUrl}/api/discussion/v2/course_topics/${courseId}`;
const datesTab = { tabId: 'dates', title: 'Dates', url: 'http://localhost/dates' };
const discussionTab = { tabId: 'discussion', title: 'Discussion', url: 'http://localhost/discussion' };
const topicsQueryKey = discussionTopicsQuery(courseId).queryKey;

// Learning registers the provider as its discussions widget's `Provider`: the sidebar provider mounts it.
describe('DiscussionsProvider', () => {
  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  // The topics loader is loaded on first render; loading it up front lets one flush settle it.
  beforeAll(() => import('./DiscussionsTopicsLoader'));

  const requestedUrls = () => axiosMock.history.get.map(request => request.url);

  const renderProvider = (tabs?: typeof datesTab[], { roleResolved = true } = {}) => {
    if (roleResolved) {
      addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar');
    }
    if (tabs) {
      seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, { tabs });
    }
    return render(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider courseId={courseId} unitId="unit-1">
          <div>child</div>
        </SidebarProvider>
      </QueryClientProvider>,
      { wrapWithRouter: true },
    );
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    axiosMock.onGet(configUrl).reply(200, { provider: 'openedx' });
    axiosMock.onGet(topicsUrl).reply(200, [{ id: 'topic-1', usage_key: 'unit-1', enabled_in_context: true }]);
  });

  afterEach(() => {
    axiosMock.restore();
  });

  it('renders its children', async () => {
    renderProvider([discussionTab]);

    expect(screen.getByText('child')).toBeInTheDocument();
    await waitFor(() => expect(requestedUrls()).toEqual([configUrl, topicsUrl]));
  });

  it('loads the topics once when the course has a discussion tab', async () => {
    renderProvider([datesTab, discussionTab]);

    await waitFor(() => expect(queryClient.getQueryData(topicsQueryKey)).toEqual([
      { id: 'topic-1', usageKey: 'unit-1', enabledInContext: true },
    ]));
    expect(requestedUrls()).toEqual([configUrl, topicsUrl]);
  });

  it('does not load the topics when the course has no discussion tab', async () => {
    renderProvider([datesTab]);
    await act(async () => {});

    expect(queryClient.getQueryState(topicsQueryKey)?.fetchStatus).toBe('idle');
    expect(requestedUrls()).toEqual([]);
  });

  it('does not load the topics before the course metadata has loaded', async () => {
    renderProvider();
    await act(async () => {});

    expect(queryClient.getQueryState(topicsQueryKey)?.fetchStatus).toBe('idle');
    expect(requestedUrls()).toEqual([]);
  });

  it('does not load the topics when nothing provides the discussions sidebar role', async () => {
    renderProvider([discussionTab], { roleResolved: false });
    await act(async () => {});

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(queryClient.getQueryState(topicsQueryKey)?.fetchStatus).toBe('idle');
    expect(requestedUrls()).toEqual([]);
  });

  it('does not load the topics again when the course metadata changes', async () => {
    renderProvider([discussionTab]);
    await waitFor(() => expect(requestedUrls()).toEqual([configUrl, topicsUrl]));

    act(() => {
      queryClient.setQueryData(
        courseHomeMetaQuery(courseId).queryKey,
        (meta) => (meta && { ...meta, isStaff: !meta.isStaff }),
      );
    });
    await act(async () => {});

    expect(requestedUrls()).toEqual([configUrl, topicsUrl]);
  });
});
