import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { appendBrowserTimezoneToUrl } from '../../utils';
import { buildSimpleCourseBlocks } from '../../shared/data/__factories__/courseBlocks.factory';
import { buildOutlineFromBlocks } from './__factories__/learningSequencesOutline.factory';
import { createTestQueryClient, initializeMockApp } from '../../setupTest';
import initializeStore from '../../store';
import { normalizeLearningSequencesData } from './utils';
import { fetchCourseSuccess } from './slice';
import { sequenceIdsSelector } from './selectors';
import { useCoursewareMetadata, useCoursewareOutline } from './apiHooks';

initializeMockApp();

describe('courseware apiHooks — coursewareMeta bridge', () => {
  const courseMetadata = Factory.build('courseMetadata');
  const courseId = courseMetadata.id;
  const { courseBlocks } = buildSimpleCourseBlocks(courseId);
  const outlineResponse = buildOutlineFromBlocks(courseBlocks);
  const normalizedOutline = normalizeLearningSequencesData(outlineResponse);
  const expectedSectionIds = normalizedOutline.courses[courseId].sectionIds;
  const expectedSequenceIds = expectedSectionIds.flatMap(
    (id: string) => normalizedOutline.sections[id].sequenceIds,
  );

  let axiosMock: MockAdapter;
  let store: ReturnType<typeof initializeStore>;
  const outlineUrl = `${getConfig().LMS_BASE_URL}/api/learning_sequences/v1/course_outline/${courseId}`;
  const metadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/courseware/course/${courseId}`);

  const coursewareMetaFor = (id: string) => (
    store.getState().models as { coursewareMeta?: Record<string, { sectionIds?: string[]; title?: string }> }
  ).coursewareMeta?.[id];

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
  });

  it('keeps coursewareMeta.sectionIds (and the sequence order nav needs) when metadata resolves after the outline', async () => {
    let resolveMetadata: () => void = () => {};
    axiosMock.onGet(outlineUrl).reply(200, outlineResponse);
    axiosMock.onGet(metadataUrl).reply(() => new Promise((resolve) => {
      resolveMetadata = () => resolve([200, courseMetadata]);
    }));

    const queryClient = createTestQueryClient(store);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(
      () => ({ meta: useCoursewareMetadata(courseId), outline: useCoursewareOutline(courseId) }),
      { wrapper },
    );

    // The outline resolves first and populates sectionIds.
    await waitFor(() => expect(coursewareMetaFor(courseId)?.sectionIds).toEqual(expectedSectionIds));
    store.dispatch(fetchCourseSuccess({ courseId }));
    expect(sequenceIdsSelector(store.getState())).toEqual(expectedSequenceIds);

    // Now let the metadata mirror land last.
    resolveMetadata();
    await waitFor(() => expect(coursewareMetaFor(courseId)?.title).toBe(courseMetadata.name));

    // sectionIds must survive.
    expect(coursewareMetaFor(courseId)?.sectionIds).toEqual(expectedSectionIds);
    expect(sequenceIdsSelector(store.getState())).toEqual(expectedSequenceIds);
  });
});
