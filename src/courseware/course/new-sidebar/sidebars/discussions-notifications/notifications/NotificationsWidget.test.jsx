/* eslint-disable react/jsx-no-constructed-context-values */
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@edx/paragon';

import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Factory } from 'rosie';
import { initializeMockApp, render, screen } from '../../../../../../setupTest';
import initializeStore from '../../../../../../store';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../../../../../utils';

import { fetchCourse } from '../../../../../data';
import SidebarContext from '../../../SidebarContext';
import NotificationsWidget from './NotificationsWidget';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('NotificationsWidget', () => {
  let axiosMock;
  let store;
  const ID = 'NEWSIDEBAR';

  const defaultMetadata = Factory.build('courseMetadata');
  const courseId = defaultMetadata.id;
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${defaultMetadata.id}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`);

  function setMetadata(attributes, options) {
    const updatedCourseHomeMetadata = Factory.build('courseHomeMetadata', attributes, options);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, updatedCourseHomeMetadata);
  }

  async function fetchAndRender(component) {
    await executeThunk(fetchCourse(defaultMetadata.id), store.dispatch);
    render(component, { store });
  }

  beforeEach(async () => {
    global.innerWidth = breakpoints.large.minWidth;
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    axiosMock.onGet(courseHomeMetadataUrl).reply(200, courseHomeMetadata);
  });

  it('renders upgrade card', async () => {
    await fetchAndRender(
      <SidebarContext.Provider value={{
        currentSidebar: ID,
        courseId,
        hideNotificationbar: false,
        isNotificationbarAvailable: true,
      }}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    const UpgradeNotification = document.querySelector('.upgrade-notification');

    expect(UpgradeNotification)
      .toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upgrade for $149' }))
      .toBeInTheDocument();
    expect(screen.queryByText('You have no new notifications at this time.'))
      .not
      .toBeInTheDocument();
  });

  it('renders no notifications bar if no verified mode', async () => {
    setMetadata({ verified_mode: null });
    await fetchAndRender(
      <SidebarContext.Provider value={{
        currentSidebar: ID,
        courseId,
        hideNotificationbar: true,
        isNotificationbarAvailable: false,
      }}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(screen.queryByText('Notifications'))
      .not
      .toBeInTheDocument();
  });

  it('marks notification as seen 3 seconds later', async () => {
    jest.useFakeTimers();
    const onNotificationSeen = jest.fn();
    await fetchAndRender(
      <SidebarContext.Provider value={{
        currentSidebar: ID,
        courseId,
        onNotificationSeen,
        hideNotificationbar: false,
        isNotificationbarAvailable: true,
      }}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(onNotificationSeen).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(3000);
    expect(onNotificationSeen).toHaveBeenCalledTimes(1);
  });
});
