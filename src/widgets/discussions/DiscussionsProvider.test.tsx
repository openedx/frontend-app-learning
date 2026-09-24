import { act, render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { courseHomeQueryKeys } from '@src/course-home/data/queryKeys';
import SidebarContext, { type SidebarContextValue } from '@src/courseware/course/sidebar/SidebarContext';
import { coursewareQueryKeys } from '@src/courseware/data/queryKeys';
import { createTestQueryClient, initializeMockApp, seedQueryData } from '@src/setupTest';

import DiscussionsProvider from './DiscussionsProvider';

initializeMockApp();

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const configUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`;
const topicsUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`;
const datesTab = { tabId: 'dates', title: 'Dates', url: 'http://localhost/dates' };
const discussionTab = { tabId: 'discussion', title: 'Discussion', url: 'http://localhost/discussion' };
const topicsQueryKey = coursewareQueryKeys.discussionTopics(courseId);

const sidebarContextValue: SidebarContextValue = {
  currentSidebar: null,
  initialSidebar: null,
  toggleSidebar: () => {},
  shouldDisplaySidebarOpen: false,
  shouldDisplayFullScreen: false,
  courseId,
  unitId: 'unit-1',
  SIDEBARS: {},
  SIDEBAR_ORDER: [],
  availableSidebarIds: [],
};

describe('DiscussionsProvider', () => {
  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  const requestedUrls = () => axiosMock.history.get.map(request => request.url);

  const renderProvider = (tabs?: typeof datesTab[]) => {
    if (tabs) {
      seedQueryData(queryClient, courseHomeQueryKeys.metadata(courseId), { tabs });
    }
    return render(
      <QueryClientProvider client={queryClient}>
        <SidebarContext.Provider value={sidebarContextValue}>
          <DiscussionsProvider>
            <div>child</div>
          </DiscussionsProvider>
        </SidebarContext.Provider>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    mergeConfig({ DISCUSSIONS_MFE_BASE_URL: 'http://localhost:2002' });
    axiosMock.onGet(configUrl).reply(200, { provider: 'openedx' });
    axiosMock.onGet(topicsUrl).reply(200, [{ id: 'topic-1', usage_key: 'unit-1', enabled_in_context: true }]);
  });

  it('renders its children', () => {
    const { getByText } = renderProvider([discussionTab]);

    expect(getByText('child')).toBeInTheDocument();
  });

  it('loads the topics once when the course has a discussion tab', async () => {
    renderProvider([datesTab, discussionTab]);

    await act(async () => {
      await queryClient.getQueryCache().find({ queryKey: topicsQueryKey })!.promise;
    });

    expect(requestedUrls()).toEqual([configUrl, topicsUrl]);
    expect(queryClient.getQueryData(topicsQueryKey)).toEqual([
      { id: 'topic-1', usageKey: 'unit-1', enabledInContext: true },
    ]);
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

  it('does not load the topics without a discussions MFE configured', async () => {
    mergeConfig({ DISCUSSIONS_MFE_BASE_URL: '' });
    renderProvider([discussionTab]);
    await act(async () => {});

    expect(queryClient.getQueryState(topicsQueryKey)?.fetchStatus).toBe('idle');
    expect(requestedUrls()).toEqual([]);
  });

  it('does not load the topics again when the course metadata changes', async () => {
    renderProvider([discussionTab]);
    await act(async () => {
      await queryClient.getQueryCache().find({ queryKey: topicsQueryKey })!.promise;
    });

    act(() => {
      queryClient.setQueryData(
        courseHomeQueryKeys.metadata(courseId),
        (meta: { tabs: typeof datesTab[] }) => ({ ...meta, celebrations: { firstSection: false } }),
      );
    });
    await act(async () => {});

    expect(requestedUrls()).toEqual([configUrl, topicsUrl]);
  });
});
