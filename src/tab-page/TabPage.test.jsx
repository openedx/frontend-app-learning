import React from 'react';
import {
  initializeTestStore, render, screen,
} from '../setupTest';
import { TabPage } from './index';
import { useToast } from '../generic/ToastContext';

// We should not test `LoadedTabPage` page here, as `TabPage` is used only for passing `passthroughProps`.
jest.mock('./LoadedTabPage', () => function () {
  return <div data-testid="LoadedTabPage" />;
});

jest.mock('../generic/ToastContext', () => ({
  ...jest.requireActual('../generic/ToastContext'),
  useToast: jest.fn(),
}));

const mockUseToast = (overrides = {}) => useToast.mockReturnValue({
  toastContent: null,
  isToastOpen: false,
  closeToast: jest.fn(),
  ...overrides,
});

describe('Tab Page', () => {
  const mockData = {
    courseStatus: 'loaded',
  };

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  beforeEach(() => {
    mockUseToast();
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

  it('renders a toast from the toast context', () => {
    mockUseToast({
      toastContent: { message: 'test-toast-header', action: { label: 'test-toast-body', href: 'test-toast-link' } },
      isToastOpen: true,
    });
    render(<TabPage {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByText('test-toast-header')).toBeInTheDocument();
    expect(screen.getByText('test-toast-body')).toBeInTheDocument();
  });

  it('displays Loaded Tab Page', () => {
    render(<TabPage {...mockData} />, { wrapWithRouter: true });
    expect(screen.getByTestId('LoadedTabPage')).toBeInTheDocument();
  });
});
