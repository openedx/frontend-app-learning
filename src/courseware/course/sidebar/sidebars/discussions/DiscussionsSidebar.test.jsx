import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import {
  initializeMockApp, initializeTestStore, render, screen,
} from '../../../../../setupTest';
import { executeThunk } from '../../../../../utils';
import { buildTopicsFromUnits } from '../../../../data/__factories__/discussionTopics.factory';
import { getCourseDiscussionTopics } from '../../../../data/thunks';
import SidebarContext from '../../SidebarContext';
import DiscussionsSidebar from './DiscussionsSidebar';

initializeMockApp();

describe('Discussions Trigger', () => {
  let axiosMock;
  let mockData;
  let courseId;
  let unitId;

  beforeEach(async () => {
    const store = await initializeTestStore({
      excludeFetchCourse: false,
      excludeFetchSequence: false,
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const state = store.getState();
    courseId = state.courseware.courseId;
    [unitId] = Object.keys(state.models.units);

    mockData = {
      courseId,
      unitId,
      currentSidebar: 'DISCUSSIONS',
    };

    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(
      200,
      {
        provider: 'openedx',
      },
    );
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
      .reply(200, buildTopicsFromUnits(state.models.units));
    await executeThunk(getCourseDiscussionTopics(courseId), store.dispatch);
  });

  function renderWithProvider(testData = {}) {
    const { container } = render(
      <SidebarContext.Provider value={{ ...mockData, ...testData }}>
        <DiscussionsSidebar />
      </SidebarContext.Provider>,
    );
    return container;
  }

  it('should show up if unit discussions associated with it', async () => {
    renderWithProvider();
    expect(screen.queryByTitle('Discussions')).toBeInTheDocument();
    expect(screen.queryByTitle('Discussions'))
      .toHaveAttribute('src', `http://localhost:2002/${courseId}/topics/topic-1?inContext`);
  });

  it('should show nothing if unit has no discussions associated with it', async () => {
    renderWithProvider({ unitId: 'no-discussion' });
    expect(screen.queryByTitle('Discussions')).not.toBeInTheDocument();
  });
});
