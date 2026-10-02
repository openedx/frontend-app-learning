import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createTestQueryClient, getTestStoreIds,
  initializeTestStore, render, screen, seedQueryData, waitFor, getByText, logUnhandledRequests,
} from '../setupTest';
import { courseHomeQueryKeys } from '../course-home/data/queryKeys';
import { coursewareQueryKeys } from '../courseware/data/queryKeys';
import InstructorToolbar from './index';

const originalConfig = jest.requireActual('@edx/frontend-platform').getConfig();
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(),
}));
getConfig.mockImplementation(() => originalConfig);

describe('Instructor Toolbar', () => {
  let courseId;
  let models;
  let mockData;
  let axiosMock;
  let masqueradeUrl;

  beforeAll(async () => {
    const store = await initializeTestStore();
    models = store.getState().models;
    courseId = getTestStoreIds(store).courseId;

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    masqueradeUrl = `${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`;
  });

  beforeEach(() => {
    mockData = {
      courseId,
      unitId: Object.values(models.units)[0].id,
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

  describe('access-expiration masquerade banner', () => {
    const bannerText = 'This learner no longer has access to this course. Their access expired on';
    const expiredAccess = { expirationDate: '2020-01-01T12:00:00Z', masqueradingExpiredCourse: true };

    function renderWithQueries(tab, seeds) {
      const queryClient = createTestQueryClient();
      seedQueryData(queryClient, courseHomeQueryKeys.metadata(courseId), { userTimezone: 'America/New_York' });
      seeds.forEach(([queryKey, data]) => seedQueryData(queryClient, queryKey, data));
      return render(
        <QueryClientProvider client={queryClient}>
          <InstructorToolbar {...mockData} tab={tab} />
        </QueryClientProvider>,
      );
    }

    it('renders the banner from the outline query on the outline tab', async () => {
      renderWithQueries('outline', [[courseHomeQueryKeys.outlineTab(courseId), { accessExpiration: expiredAccess }]]);

      expect(await screen.findByText(bannerText, { exact: false })).toBeInTheDocument();
      expect(screen.getByText('1/1/2020', { exact: false })).toBeInTheDocument();
    });

    it('does not render the banner on the courseware tab even when the courseware metadata carries the flag', async () => {
      renderWithQueries('courseware', [
        [coursewareQueryKeys.metadata(courseId), { accessExpiration: expiredAccess }],
        [courseHomeQueryKeys.outlineTab(courseId), { accessExpiration: expiredAccess }],
      ]);

      await waitFor(() => expect(axiosMock.history.get).toHaveLength(1));
      expect(screen.queryByText(bannerText, { exact: false })).not.toBeInTheDocument();
    });
  });
});
