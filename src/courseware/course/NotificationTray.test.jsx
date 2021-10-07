import React from 'react';
import { Factory } from 'rosie';
import MockAdapter from 'axios-mock-adapter';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchCourse } from '../data';
import {
  render, initializeMockApp, screen, fireEvent, waitFor,
} from '../../setupTest';
import initializeStore from '../../store';
import { appendBrowserTimezoneToUrl, executeThunk } from '../../utils';
import NotificationTray from './NotificationTray';
import useWindowSize from '../../generic/tabs/useWindowSize';

initializeMockApp();
jest.mock('../../generic/tabs/useWindowSize');
jest.mock('@edx/frontend-platform/analytics');

describe('NotificationTray', () => {
  let mockData;
  let axiosMock;
  let store;

  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  const defaultMetadata = Factory.build('courseMetadata', { id: courseId });
  let courseMetadataUrl = `${getConfig().LMS_BASE_URL}/api/courseware/course/${defaultMetadata.id}`;
  courseMetadataUrl = appendBrowserTimezoneToUrl(courseMetadataUrl);

  function setMetadata(attributes, options) {
    const courseMetadata = Factory.build('courseMetadata', { id: courseId, ...attributes }, options);
    axiosMock.onGet(courseMetadataUrl).reply(200, courseMetadata);
  }

  async function fetchAndRender(component) {
    await executeThunk(fetchCourse(defaultMetadata.id), store.dispatch);
    render(component, { store });
  }

  beforeEach(async () => {
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(courseMetadataUrl).reply(200, defaultMetadata);
    mockData = {
      toggleNotificationTray: () => {},
    };
  });

  it('renders notification tray and close tray button', async () => {
    useWindowSize.mockReturnValue({ width: 1200 });
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockData,
      toggleNotificationTray,
    };
    await fetchAndRender(<NotificationTray {...testData} />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    const notificationCloseIconButton = screen.getByRole('button', { name: /Close notification tray/i });
    expect(notificationCloseIconButton).toBeInTheDocument();
    expect(notificationCloseIconButton).toHaveClass('btn-icon-primary');
    fireEvent.click(notificationCloseIconButton);
    expect(toggleNotificationTray).toHaveBeenCalledTimes(1);

    // should not render responsive "Back to course" to close the tray
    expect(screen.queryByText('Back to course')).not.toBeInTheDocument();
  });

  it('renders upgrade card', async () => {
    await fetchAndRender(<NotificationTray />);
    const UpgradeNotification = document.querySelector('.upgrade-notification');

    expect(UpgradeNotification).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upgrade for $149' })).toBeInTheDocument();
    expect(screen.queryByText('You have no new notifications at this time.')).not.toBeInTheDocument();
  });

  it('renders no notifications message if no verified mode', async () => {
    setMetadata({ verified_mode: null });
    await fetchAndRender(<NotificationTray />);
    expect(screen.queryByText('You have no new notifications at this time.')).toBeInTheDocument();
  });

  it('renders notification tray with full screen "Back to course" at responsive view', async () => {
    useWindowSize.mockReturnValue({ width: 991 });
    const toggleNotificationTray = jest.fn();
    const testData = {
      ...mockData,
      toggleNotificationTray,
    };
    await fetchAndRender(<NotificationTray {...testData} />);

    const responsiveCloseButton = screen.getByRole('button', { name: 'Back to course' });
    await waitFor(() => expect(responsiveCloseButton).toBeInTheDocument());

    fireEvent.click(responsiveCloseButton);
    expect(toggleNotificationTray).toHaveBeenCalledTimes(1);
  });
});
