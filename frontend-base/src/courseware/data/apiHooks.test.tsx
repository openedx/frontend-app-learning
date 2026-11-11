import { getAuthenticatedHttpClient, getSiteConfig } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { type ReactNode } from 'react';
import { Factory } from 'rosie';

import { queryDefaults } from '@src/queryClient';
import { createTestQueryClient } from '@src/tests/queryClient';
import { coursewareMetadataQuery, useCoursewareMetadata } from './apiHooks';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const metadataUrl = new RegExp(`${getSiteConfig().lmsBaseUrl}/api/courseware/course/*`);

const buildWrapper = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe('courseware apiHooks', () => {
  let axiosMock: MockAdapter;

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(metadataUrl).reply(200, Factory.build('courseMetadata'));
  });

  it('coursewareMetadataQuery carries the query defaults', () => {
    expect(coursewareMetadataQuery(courseId)).toMatchObject(queryDefaults);
  });

  describe('useCoursewareMetadata', () => {
    it('fetches the course metadata once', async () => {
      const { result } = renderHook(() => useCoursewareMetadata(courseId), buildWrapper());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.id).toBe(courseId);
      expect(axiosMock.history.get).toHaveLength(1);
    });

    it.each([
      ['it is disabled', courseId, { enabled: false }],
      ['it has no course id', undefined, undefined],
    ])('requests nothing when %s', (_name, id, options) => {
      const { result } = renderHook(() => useCoursewareMetadata(id, options), buildWrapper());

      expect(result.current.fetchStatus).toBe('idle');
      expect(axiosMock.history.get).toHaveLength(0);
    });
  });
});
