/* eslint-disable react/jsx-no-constructed-context-values */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import {
  createTestQueryClient, initializeMockApp, getTestStoreIds, initializeTestStore, render, screen,
} from '@src/setupTest';
import { buildTopicsFromUnits } from '@src/courseware/data/__factories__/discussionTopics.factory';
import { discussionTopicsQuery } from '@src/courseware/data/apiHooks';
import { SidebarProvider } from '@src/courseware/course/sidebar/SidebarContext';
import DiscussionsSidebar from './DiscussionsSidebar';

initializeMockApp();

describe('Discussions Trigger', () => {
  let axiosMock;
  let queryClient;
  let mockData;
  let courseId;
  let unitId;
  let configUrl;
  let topicsUrl;

  beforeEach(async () => {
    const store = await initializeTestStore({
      excludeFetchCourse: false,
      excludeFetchSequence: false,
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const state = store.getState();
    courseId = getTestStoreIds(store).courseId;
    [unitId] = Object.keys(state.models.units);

    mockData = {
      courseId,
      unitId,
    };

    configUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`;
    topicsUrl = `${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`;
    axiosMock.onGet(configUrl).reply(200, { provider: 'openedx' });
    axiosMock.onGet(topicsUrl).reply(200, buildTopicsFromUnits(state.models.units));
    // Load the topics into the client the render uses; the sidebar reads them without fetching.
    queryClient = createTestQueryClient();
    await queryClient.query(discussionTopicsQuery(courseId));
  });

  function renderWithProvider(testData = {}) {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider courseId={courseId} unitId={testData.unitId ?? mockData.unitId} widgets={[]}>
          <DiscussionsSidebar />
        </SidebarProvider>
      </QueryClientProvider>,
      { wrapWithRouter: true },
    );
    return container;
  }

  it('should show up if unit discussions associated with it', async () => {
    renderWithProvider();
    expect(screen.queryByTitle('Discussions')).toBeInTheDocument();
    expect(screen.queryByTitle('Discussions'))
      .toHaveAttribute('src', `http://localhost:2002/${courseId}/category/${unitId}?inContextSidebar`);
  });

  it('should show nothing if unit has no discussions associated with it', async () => {
    renderWithProvider({ unitId: 'no-discussion' });
    expect(screen.queryByTitle('Discussions')).not.toBeInTheDocument();
  });

  it('reads the topics without requesting them', async () => {
    renderWithProvider();
    expect(await screen.findByTitle('Discussions')).toBeInTheDocument();

    // Only the seed's two requests; the sidebar's read added none.
    expect(axiosMock.history.get.map(request => request.url)).toEqual([configUrl, topicsUrl]);
  });
});
