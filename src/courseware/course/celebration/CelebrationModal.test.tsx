import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  createTestQueryClient, initializeTestStore, render, screen, seedQueryData, waitFor,
} from '../../../setupTest';
import type { CourseHomeMeta } from '../../../course-home/data/apiHooks';
import { courseHomeQueryKeys } from '../../../course-home/data/queryKeys';
import CelebrationModal from './CelebrationModal';

jest.mock('@edx/frontend-platform/analytics');

describe('CelebrationModal', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const queryKey = courseHomeQueryKeys.metadata(courseId);
  const celebrationUrl = new URL(`${getConfig().LMS_BASE_URL}/api/courseware/celebration/${courseId}`).href;
  let axiosMock: MockAdapter;
  let queryClient: QueryClient;

  function renderModal(isOpen: boolean) {
    queryClient = createTestQueryClient();
    seedQueryData(queryClient, queryKey, { org: 'edX', celebrations: { firstSection: true, weeklyGoal: false } });
    return render(
      <QueryClientProvider client={queryClient}>
        <CelebrationModal courseId={courseId} isOpen={isOpen} onClose={jest.fn()} />
      </QueryClientProvider>,
    );
  }

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  beforeEach(() => {
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPost(celebrationUrl).reply(200);
  });

  it('records the celebration when it opens: tells the LMS, marks the first section celebrated in the query, tracks the org', async () => {
    renderModal(true);

    expect(screen.getByRole('dialog')).toHaveTextContent('Congratulations!');
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].url).toBe(celebrationUrl);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ first_section: false }));
    expect(queryClient.getQueryData<CourseHomeMeta>(queryKey)?.celebrations)
      .toEqual({ firstSection: false, weeklyGoal: false });
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.ui.lms.celebration.first_section.opened', expect.objectContaining({
      org_key: 'edX',
      courserun_key: courseId,
    }));
  });

  it('records nothing while closed', () => {
    renderModal(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(queryClient.getQueryData<CourseHomeMeta>(queryKey)?.celebrations)
      .toEqual({ firstSection: true, weeklyGoal: false });
  });
});
