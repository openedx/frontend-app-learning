/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';

import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { breakpoints } from '@openedx/paragon';

import {
  initializeMockApp, render, screen, within, act, fireEvent, waitFor,
} from '../../../../../../setupTest';
import initializeStore from '../../../../../../store';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../../../../../utils';
import { fetchCourse } from '../../../../../data';
import SidebarContext, { SidebarContextData } from '../../../SidebarContext';
import NotificationsWidget from './NotificationsWidget';
import setupDiscussionSidebar from '../../../../test-utils';

initializeMockApp();
jest.mock('@edx/frontend-platform/analytics');

describe('NotificationsWidget', () => {
  let axiosMock;
  let store;
  const ID = 'DISCUSSIONS_NOTIFICATIONS';
  const defaultMetadata = Factory.build('courseMetadata');
  const courseId = defaultMetadata.id;
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${defaultMetadata.id}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  const courseHomeMetadata = Factory.build('courseHomeMetadata');
  const courseHomeMetadataUrl = appendBrowserTimezoneToUrl(`${getConfig().LMS_BASE_URL}/api/course_home/course_metadata/${courseId}`);

  function setMetadata(attributes, options = undefined) {
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

  it('successfully Open/Hide sidebar tray', async () => {
    const userVerifiedMode = Factory.build('verifiedMode');
    await setupDiscussionSidebar({ verifiedMode: userVerifiedMode, isNewDiscussionSidebarViewEnabled: true });

    const sidebarButton = await screen.getByRole('button', { name: /Show sidebar tray/i });

    await act(async () => {
      fireEvent.click(sidebarButton);
    });

    await waitFor(async () => {
      expect(screen.queryByTestId('sidebar-DISCUSSIONS_NOTIFICATIONS')).toBeInTheDocument();
      expect(screen.queryByTestId('notification-widget')).toBeInTheDocument();
      expect(screen.queryByTitle('Discussions')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(sidebarButton);
    });

    await waitFor(async () => {
      expect(screen.queryByTestId('sidebar-DISCUSSIONS_NOTIFICATIONS')).not.toBeInTheDocument();
      expect(screen.queryByTestId('notification-widget')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Discussions')).not.toBeInTheDocument();
    });
  });

  it('includes notification_widget_slot', async () => {
    await fetchAndRender(
      <SidebarContext.Provider value={{
        currentSidebar: ID,
        courseId,
        hideNotificationbar: false,
        isNotificationbarAvailable: true,
      } as SidebarContextData}
      >
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(screen.getByTestId('notification_widget_slot')).toBeInTheDocument();
  });

  it('renders upgrade card', async () => {
    const contextData: Partial<SidebarContextData> = {
      currentSidebar: ID,
      courseId,
      hideNotificationbar: false,
      isNotificationbarAvailable: true,
    };
    await fetchAndRender(
      <SidebarContext.Provider value={contextData as SidebarContextData}>
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );

    // The Upgrade Notification should be inside the PluginSlot.
    const UpgradeNotification = document.querySelector('.upgrade-notification');
    expect(UpgradeNotification).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Upgrade for $149' })).toBeInTheDocument();
    expect(screen.queryByText('You have no new notifications at this time.')).not.toBeInTheDocument();
  });

  it('renders no notifications bar if no verified mode', async () => {
    setMetadata({ verified_mode: null });
    const contextData: Partial<SidebarContextData> = {
      currentSidebar: ID,
      courseId,
      hideNotificationbar: true,
      isNotificationbarAvailable: false,
    };
    await fetchAndRender(
      <SidebarContext.Provider value={contextData as SidebarContextData}>
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it.each([
    {
      description: 'close the notification widget.',
      enabledInContext: true,
      testId: 'notification-widget',
    },
    {
      description: 'close the sidebar when the notification widget is closed, and the discussion widget is unavailable.',
      enabledInContext: false,
      testId: 'sidebar-DISCUSSIONS_NOTIFICATIONS',
    },
  ])('successfully %s', async ({ enabledInContext, testId }) => {
    const userVerifiedMode = Factory.build('verifiedMode');

    await setupDiscussionSidebar({
      verifiedMode: userVerifiedMode,
      enabledInContext,
      isNewDiscussionSidebarViewEnabled: true,
    });

    const sidebarButton = screen.getByRole('button', { name: /Show sidebar tray/i });

    await act(async () => {
      fireEvent.click(sidebarButton);
    });

    const notificationWidget = await waitFor(() => screen.getByTestId('notification-widget'));
    const closeNotificationButton = within(notificationWidget).getByRole('button', { name: /Close/i });

    await act(async () => {
      fireEvent.click(closeNotificationButton);
    });

    await waitFor(() => {
      expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    });
  });

  it('marks notification as seen 3 seconds later', async () => {
    const onNotificationSeen = jest.fn();
    const contextData: Partial<SidebarContextData> = {
      currentSidebar: ID,
      courseId,
      onNotificationSeen,
      hideNotificationbar: false,
      isNotificationbarAvailable: true,
    };
    await fetchAndRender(
      <SidebarContext.Provider value={contextData as SidebarContextData}>
        <NotificationsWidget />
      </SidebarContext.Provider>,
    );
    expect(onNotificationSeen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(onNotificationSeen).toHaveBeenCalledTimes(1), { timeout: 3500 });
  });
});
