import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { createTestQueryClient, initializeMockApp, seedQueryData } from '@src/setupTest';
import { courseHomeQueryKeys } from '@src/course-home/data/queryKeys';
import { useCourseOutlineUrl, useDatesTabUrl, useProgressTabUrl } from './hooks';

initializeMockApp();

const courseHomeMetadata = camelCaseObject(Factory.build('courseHomeMetadata'));
const courseId: string = courseHomeMetadata.id;
const tabUrl = (tabId: string) => courseHomeMetadata.tabs.find((tab) => tab.tabId === tabId).url;

let axiosMock: MockAdapter;
let queryClient: QueryClient;

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={[`/course/${courseId}/home`]}>
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/course/:courseId/home" element={children} />
      </Routes>
    </QueryClientProvider>
  </MemoryRouter>
);

const metadataRequests = () => axiosMock.history.get.filter((req) => req.url?.includes('/course_metadata/'));

beforeEach(() => {
  axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  queryClient = createTestQueryClient();
});

describe.each([
  ['useCourseOutlineUrl', useCourseOutlineUrl, 'courseware'],
  ['useDatesTabUrl', useDatesTabUrl, 'dates'],
  ['useProgressTabUrl', useProgressTabUrl, 'progress'],
])('%s', (_name, useTabUrl, tabId) => {
  it('returns the tab\'s url from the course metadata on the page', () => {
    seedQueryData(queryClient, courseHomeQueryKeys.metadata(courseId), courseHomeMetadata);
    const { result } = renderHook(() => useTabUrl(), { wrapper });

    expect(result.current).toBe(tabUrl(tabId));
    expect(metadataRequests()).toHaveLength(0);
  });

  it('fetches nothing on its own', () => {
    const { result } = renderHook(() => useTabUrl(), { wrapper });

    expect(result.current).toBeUndefined();
    expect(metadataRequests()).toHaveLength(0);
  });
});
