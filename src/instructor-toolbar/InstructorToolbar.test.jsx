import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  initializeTestStore, render, screen, waitFor, getByText, logUnhandledRequests,
} from '../setupTest';
import InstructorToolbar from './index';

const originalConfig = jest.requireActual('@edx/frontend-platform').getConfig();
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));
getConfig.mockImplementation(() => originalConfig);

describe('Instructor Toolbar', () => {
  let courseware;
  let models;
  let mockData;
  let axiosMock;
  let masqueradeUrl;

  beforeAll(async () => {
    const store = await initializeTestStore();
    courseware = store.getState().courseware;
    models = store.getState().models;

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    masqueradeUrl = `${getConfig().LMS_BASE_URL}/courses/${courseware.courseId}/masquerade`;
  });

  beforeEach(() => {
    mockData = {
      courseId: courseware.courseId,
      unitId: Object.values(models.units)[0].id,
      canViewLegacyCourseware: true,
    };
    axiosMock.reset();
    axiosMock.onGet(masqueradeUrl).reply(200, { success: true });
    logUnhandledRequests(axiosMock);
  });

  it('sends query to masquerade and does not display alerts by default', async () => {
    render(<InstructorToolbar {...mockData} />);

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays masquerade error', async () => {
    axiosMock.reset();
    axiosMock.onGet(masqueradeUrl).reply(200, { success: false });
    render(<InstructorToolbar {...mockData} />);

    await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to get masquerade options');
  });

  it('displays links to view course in available services', () => {
    const config = { ...originalConfig };
    config.INSIGHTS_BASE_URL = 'http://localhost:18100';
    getConfig.mockImplementation(() => config);
    render(<InstructorToolbar {...mockData} />);

    const linksContainer = screen.getByText('View course in:').parentElement;
    ['Legacy experience', 'Studio', 'Insights'].forEach(service => {
      expect(getByText(linksContainer, service).getAttribute('href')).toMatch(/http.*/);
    });
  });

  it('displays links to view course in available services - false legacy courseware flag', () => {
    const config = { ...originalConfig };
    config.INSIGHTS_BASE_URL = 'http://localhost:18100';
    getConfig.mockImplementation(() => config);
    mockData.canViewLegacyCourseware = false;
    render(<InstructorToolbar {...mockData} />);

    const linksContainer = screen.getByText('View course in:').parentElement;
    ['Studio', 'Insights'].forEach(service => {
      expect(getByText(linksContainer, service).getAttribute('href')).toMatch(/http.*/);
    });
  });

  it('displays links to view course in available services - empty unit', () => {
    const config = { ...originalConfig };
    config.INSIGHTS_BASE_URL = 'http://localhost:18100';
    getConfig.mockImplementation(() => config);
    mockData.unitId = undefined;
    render(<InstructorToolbar {...mockData} />);

    const linksContainer = screen.getByText('View course in:').parentElement;
    ['Studio', 'Insights'].forEach(service => {
      expect(getByText(linksContainer, service).getAttribute('href')).toMatch(/http.*/);
    });
  });

  it('does not display links if there are no services available', () => {
    const config = { ...originalConfig };
    config.STUDIO_BASE_URL = undefined;
    getConfig.mockImplementation(() => config);
    render(<InstructorToolbar {...mockData} unitId={null} />);

    expect(screen.queryByText('View course in:')).not.toBeInTheDocument();
  });
});
