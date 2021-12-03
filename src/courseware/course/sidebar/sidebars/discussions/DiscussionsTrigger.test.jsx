import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import {
  fireEvent, initializeMockApp, initializeTestStore, render, screen,
} from '../../../../../setupTest';
import { buildTopicsFromUnits } from '../../../../data/__factories__/discussionTopics.factory';
import SidebarContext from '../../SidebarContext';
import DiscussionsTrigger from './DiscussionsTrigger';

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
    };

    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v1/courses/${courseId}`).reply(
      200,
      {
        provider: 'openedx',
      },
    );
    axiosMock.onGet(`${getConfig().LMS_BASE_URL}/api/discussion/v2/course_topics/${courseId}`)
      .reply(200, buildTopicsFromUnits(state.models.units));
  });

  function renderWithProvider(testData = {}, onClick = () => null) {
    const { container } = render(
      <SidebarContext.Provider value={{ ...mockData, ...testData }}>
        <DiscussionsTrigger onClick={onClick} />
      </SidebarContext.Provider>,
    );
    return container;
  }

  it('shows up and handles onClick even if unit has discussion associated with it', async () => {
    const clickTrigger = jest.fn();
    renderWithProvider({}, clickTrigger);

    const notificationTrigger = await screen.findByRole('button', { name: /Show discussions tray/i });
    expect(notificationTrigger).toBeInTheDocument();
    fireEvent.click(notificationTrigger);
    expect(clickTrigger).toHaveBeenCalledTimes(1);
  });

  it('doesn\'t show up if unit has no discussion associated with it', async () => {
    const clickTrigger = jest.fn();
    renderWithProvider({ unitId: 'has-no-discussion' }, clickTrigger);

    expect(await screen.queryByRole('button', { name: /Show discussions tray/i })).not.toBeInTheDocument();
  });
});
