import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';

import { createTestQueryClient, initializeMockApp, seedQueryData } from '../../setupTest';
import { courseHomeQueryKeys } from '../data/queryKeys';
import { useExamsData } from './hooks';

initializeMockApp();

describe('useExamsData', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const blockKey = (name) => `block-v1:edX+DemoX+Demo_Course+type@sequential+block@${name}`;
  const sectionScores = [
    { display_name: 'Section 1', subsections: [{ block_key: blockKey('exam1') }, { block_key: blockKey('homework1') }] },
    { display_name: 'Section 2', subsections: [{ block_key: blockKey('final_exam') }] },
  ];
  const examFor = (name) => ({
    exam: {
      id: name.length, course_id: courseId, content_id: blockKey(name), exam_name: `Exam ${name}`,
    },
  });

  let axiosMock;
  let queryClient;

  const wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[`/course/${courseId}/progress`]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/course/:courseId/progress/:targetUserId?" element={children} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );

  const seedProgress = (scores) => seedQueryData(
    queryClient,
    courseHomeQueryKeys.progressTab(courseId, undefined),
    camelCaseObject(Factory.build('progressTabData', { section_scores: scores })),
  );

  const attemptRequests = () => axiosMock.history.get.filter((req) => req.url.includes('/exam/attempt/'));
  const notFound = () => Promise.reject(Object.assign(new Error('Request failed with status code 404'), {
    response: { status: 404, data: {} },
    customAttributes: { httpErrorStatus: 404 },
  }));

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient = createTestQueryClient();
    axiosMock.onGet(/exam1/).reply(200, examFor('exam1'));
    axiosMock.onGet(/homework1/).reply(notFound);
    axiosMock.onGet(/final_exam/).reply(200, examFor('final_exam'));
  });

  it('is null and requests nothing until the progress data is present', () => {
    const { result } = renderHook(() => useExamsData(), { wrapper });

    expect(result.current).toBeNull();
    expect(attemptRequests()).toHaveLength(0);
  });

  it('fetches one attempt per subsection, in sectionScores order, with {} where there is none', async () => {
    seedProgress(sectionScores);
    const { result } = renderHook(() => useExamsData(), { wrapper });

    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).not.toBeNull());

    expect(attemptRequests().map((req) => decodeURIComponent(req.url).split('/content_id/')[1])).toEqual(
      [blockKey('exam1'), blockKey('homework1'), blockKey('final_exam')],
    );
    expect(result.current).toEqual([
      camelCaseObject(examFor('exam1').exam),
      {},
      camelCaseObject(examFor('final_exam').exam),
    ]);
  });

  it('fetches again when the progress data changes the subsection list', async () => {
    seedProgress([sectionScores[0]]);
    const { result } = renderHook(() => useExamsData(), { wrapper });
    await waitFor(() => expect(result.current).toHaveLength(2));

    seedProgress(sectionScores);
    await waitFor(() => expect(result.current).toHaveLength(3));
    expect(attemptRequests()).toHaveLength(5);
  });
});
