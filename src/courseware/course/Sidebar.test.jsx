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
import Sidebar from './Sidebar';
import useWindowSize from '../../generic/tabs/useWindowSize';

initializeMockApp();
jest.mock('../../generic/tabs/useWindowSize');
jest.mock('@edx/frontend-platform/analytics');

describe('Sidebar', () => {
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
      toggleSidebar: () => {},
    };
  });

  it('renders sidebar', async () => {
    useWindowSize.mockReturnValue({ width: 1200, height: 422 });
    await fetchAndRender(<Sidebar />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.queryByText('Back to course')).not.toBeInTheDocument();
  });

  it('renders upgrade card', async () => {
    await fetchAndRender(<Sidebar />);
    const upgradeCard = document.querySelector('.upgrade-card');

    expect(upgradeCard).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upgrade for $149' })).toBeInTheDocument();
    expect(screen.queryByText('You have no new notifications at this time.')).not.toBeInTheDocument();
  });

  it('renders no notifications message if no verified mode', async () => {
    setMetadata({ verified_mode: null });
    await fetchAndRender(<Sidebar />);
    expect(screen.queryByText('You have no new notifications at this time.')).toBeInTheDocument();
  });

  it('renders sidebar with full screen "Back to course" at response width', async () => {
    useWindowSize.mockReturnValue({ width: 991, height: 422 });
    const toggleSidebar = jest.fn();
    const testData = {
      ...mockData,
      toggleSidebar,
    };
    await fetchAndRender(<Sidebar {...testData} />);

    const responsiveCloseButton = screen.getByRole('button', { name: 'Back to course' });
    await waitFor(() => expect(responsiveCloseButton).toBeInTheDocument());

    fireEvent.click(responsiveCloseButton);
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });
});
