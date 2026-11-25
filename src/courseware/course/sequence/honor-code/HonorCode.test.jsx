import {
  getAuthenticatedHttpClient, getSiteConfig, mergeAppConfig,
} from '@openedx/frontend-base';
import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  act, fireEvent, screen, waitFor,
} from '@testing-library/react';

import { appId } from '@src/constants';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { authenticatedUser } from '@src/tests/authenticatedUser';
import { mockCourseRequests } from '@src/tests/courseware';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import { getCourseHomeCourseMetadata } from '../../../../course-home/data/api';
import HonorCode from './HonorCode';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Honor Code', () => {
  let axiosMock;
  let courseHomeMeta;
  let honorCodePostUrl;
  const mockData = {};

  async function setupCourse(courseHomeMetaOptions) {
    if (courseHomeMetaOptions) {
      const courseHomeMetadata = Factory.build('courseHomeMetadata', courseHomeMetaOptions);
      mockData.courseId = mockCourseRequests({ courseHomeMetadata }).courseId;
    } else {
      mockData.courseId = mockCourseRequests().courseId;
    }
    courseHomeMeta = await getCourseHomeCourseMetadata(mockData.courseId);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    honorCodePostUrl = `${getSiteConfig().lmsBaseUrl}/api/agreements/v1/integrity_signature/${mockData.courseId}`;
  }

  // The suite's own axios adapter replaces the one mocking the metadata endpoint, so the component
  // reads the course metadata, fetched before the swap, from a seeded query rather than a mounted fetch.
  function renderHonorCode() {
    const queryClient = createTestQueryClient();
    seedQueryData(
      queryClient,
      courseHomeMetaQuery(mockData.courseId).queryKey,
      courseHomeMeta,
    );
    return render(
      <QueryClientProvider client={queryClient}>
        <HonorCode {...mockData} />
      </QueryClientProvider>,
      { wrapWithRouter: true },
    );
  }

  it('cancel button links to course home ', async () => {
    await setupCourse();
    renderHonorCode();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith(`/learning/course/${mockData.courseId}/home`);
  });

  it('calls to save integrity_signature when agreeing', async () => {
    await setupCourse({ username: authenticatedUser.username });
    renderHonorCode();
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(honorCodePostUrl);
    });
  });

  it('still calls to save integrity_signature if masquerading', async () => {
    await setupCourse(
      {
        is_staff: false,
        original_user_is_staff: true,
        username: authenticatedUser.username,
      },
    );
    renderHonorCode();
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].url).toBe(honorCodePostUrl);
    });
  });

  it('will not call to save integrity_signature if masquerading a specific student', async () => {
    await setupCourse(
      {
        is_staff: false,
        original_user_is_staff: true,
        username: 'otheruser',
      },
    );
    renderHonorCode();
    const agreeButton = screen.getByText('I agree');
    fireEvent.click(agreeButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
  });

  describe('honor code link', () => {
    afterEach(() => {
      act(() => mergeAppConfig(appId, { TERMS_OF_SERVICE_URL: null }));
    });

    it('links to the honor code on the terms of service page when the site has one', async () => {
      mergeAppConfig(appId, { TERMS_OF_SERVICE_URL: 'https://example.com/tos' });
      await setupCourse();
      renderHonorCode();

      expect(screen.getByRole('link', { name: 'Honor Code' })).toHaveAttribute('href', 'https://example.com/tos#honor-code');
    });

    it('names the honor code without a link when the site has no terms of service page', async () => {
      await setupCourse();
      renderHonorCode();

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByText(/will abide by the Honor Code for the/)).toBeInTheDocument();
    });
  });

  afterEach(async () => {
    axiosMock.resetHistory();
  });
});
