import React from 'react';
import {
  matchRoutes, MemoryRouter, Route, Routes,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { camelCaseObject, getAuthenticatedHttpClient } from '@openedx/frontend-base';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { courseDatesRole, courseOutlineRole, courseProgressRole } from '@src/constants';
import routes from '@src/routes';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { useCourseOutlineUrl, useDatesTabUrl, useProgressTabUrl } from './hooks';

const courseHomeMetadata = camelCaseObject(Factory.build('courseHomeMetadata'));
const courseId: string = courseHomeMetadata.id;

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
  ['useCourseOutlineUrl', useCourseOutlineUrl, 'courseware', courseOutlineRole],
  ['useDatesTabUrl', useDatesTabUrl, 'dates', courseDatesRole],
  ['useProgressTabUrl', useProgressTabUrl, 'progress', courseProgressRole],
])('%s', (_name, useTabUrl, tabId, role) => {
  it('returns the tab\'s url from the course metadata on the page', () => {
    seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, courseHomeMetadata);
    const { result } = renderHook(() => useTabUrl(), { wrapper });
    const match = matchRoutes(routes, result.current!)?.at(-1);

    expect(match?.route.handle?.roles).toContain(role);
    expect(match?.params).toEqual({ courseId });
    expect(metadataRequests()).toHaveLength(0);
  });

  it('returns undefined when the course metadata on the page does not list the tab', () => {
    seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, {
      ...courseHomeMetadata,
      tabs: courseHomeMetadata.tabs.filter((tab) => tab.tabId !== tabId),
    });
    const { result } = renderHook(() => useTabUrl(), { wrapper });

    expect(result.current).toBeUndefined();
  });

  it('fetches nothing on its own', () => {
    const { result } = renderHook(() => useTabUrl(), { wrapper });

    expect(result.current).toBeUndefined();
    expect(metadataRequests()).toHaveLength(0);
  });
});
