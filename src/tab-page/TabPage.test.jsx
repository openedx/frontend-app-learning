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
jest.mock('./LoadedTabPage', () => function () {
  return <div data-testid="LoadedTabPage" />;
});

describe('Tab Page', () => {
  const mockData = {
    courseStatus: 'loaded',
  };

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  it('displays loading message', () => {
    render(<TabPage {...mockData} courseStatus="loading" />, { wrapWithRouter: true });
    expect(screen.getByText('Loading course page…')).toBeInTheDocument();
  });

  it('displays loading failure message', () => {
    render(<TabPage {...mockData} courseStatus="other" />, { wrapWithRouter: true });
    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('displays custom error message from courseHome state when available', async () => {
    const customErrorMessage = 'This course is not currently accessible. The course team has restricted access to this content.';
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    // Manually dispatch a failure with the custom error message
    testStore.dispatch({
      type: 'course-home/fetchTabFailure',
      payload: { courseId: 'test-course', errorMessage: customErrorMessage, errorCode: 'not_visible_in_catalog' },
    });
    render(<TabPage {...mockData} courseStatus="failed" />, { store: testStore, wrapWithRouter: true });
    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
    expect(screen.queryByText('There was an error loading this course.')).not.toBeInTheDocument();
  });

  it('displays custom error message from courseware state when available', async () => {
    const customErrorMessage = 'This course is not currently accessible. The course team has restricted access to this content.';
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    // Manually dispatch a courseware failure with the custom error message
    testStore.dispatch({
      type: 'courseware/fetchCourseFailure',
      payload: { courseId: 'test-course', errorMessage: customErrorMessage, errorCode: 'not_visible_in_catalog' },
    });
    render(<TabPage {...mockData} courseStatus="failed" />, { store: testStore, wrapWithRouter: true });
    expect(screen.getByText(customErrorMessage)).toBeInTheDocument();
    expect(screen.queryByText('There was an error loading this course.')).not.toBeInTheDocument();
  });

  it('displays generic error message when no custom error message is available', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    testStore.dispatch({
      type: 'course-home/fetchTabFailure',
      payload: { courseId: 'test-course' },
    });
    render(<TabPage {...mockData} courseStatus="failed" />, { store: testStore, wrapWithRouter: true });
    expect(screen.getByText('There was an error loading this course.')).toBeInTheDocument();
  });

  it('displays Learning Toast', async () => {
    const testStore = await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true }, false);
    render(<TabPage {...mockData} />, { store: testStore, wrapWithRouter: true });

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
    render(<TabPage {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByTestId('LoadedTabPage')).toBeInTheDocument();
  });
});
