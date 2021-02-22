import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  initializeTestStore, logUnhandledRequests, render, screen,
} from '../setupTest';
import { TabPage } from './index';
import { executeThunk } from '../utils';
import * as thunks from '../course-home/data/thunks';

// We should not test `LoadedTabPage` page here, as `TabPage` is used only for passing `passthroughProps`.
jest.mock('./LoadedTabPage', () => () => <div data-testid="LoadedTabPage" />);

describe('Tab Page', () => {
  const mockData = {
    courseStatus: 'loaded',
  };

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  it('displays loading message', () => {
    render(<TabPage {...mockData} courseStatus="loading" />);
    expect(screen.getByText('Loading course page…')).toBeInTheDocument();
  });

  it('displays loading failure message', () => {
    render(<TabPage {...mockData} courseStatus="other" />);
    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('displays Learning Toast', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    render(<TabPage {...mockData} />, { store: testStore });

    const resetUrl = `${getConfig().LMS_BASE_URL}/api/course_experience/v1/reset_course_deadlines`;
    const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onPost(resetUrl).reply(201, {
      link: 'test-toast-link',
      link_text: 'test-toast-body',
      header: 'test-toast-header',
    });
    logUnhandledRequests(axiosMock);

    const getTabDataMock = jest.fn(() => ({
      type: 'MOCK_ACTION',
    }));
    const model = 'outline';

    await executeThunk(thunks.resetDeadlines('courseId', model, getTabDataMock), testStore.dispatch);

    expect(screen.getByText('test-toast-header')).toBeInTheDocument();
    expect(screen.getByText('test-toast-body')).toBeInTheDocument();
  });

  it('displays Loaded Tab Page', () => {
    render(<TabPage {...mockData} />);
    expect(screen.getByTestId('LoadedTabPage')).toBeInTheDocument();
  });
});
