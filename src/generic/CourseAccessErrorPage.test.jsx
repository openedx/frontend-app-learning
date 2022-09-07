import React from 'react';
import { history } from '@edx/frontend-platform';
import { Route } from 'react-router';
import { initializeTestStore, render, screen } from '../setupTest';
import CourseAccessErrorPage from './CourseAccessErrorPage';

const mockDispatch = jest.fn();
let mockCourseStatus;
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: () => ({ courseStatus: mockCourseStatus }),
}));
jest.mock('./PageLoading', () => () => <div data-testid="page-loading" />);

describe('CourseAccessErrorPage', () => {
  let courseId;
  let accessDeniedUrl;
  beforeEach(async () => {
    const store = await initializeTestStore({ excludeFetchSequence: true });
    courseId = store.getState().courseware.courseId;
    accessDeniedUrl = `/course/${courseId}/access-denied`;
    history.push(accessDeniedUrl);
  });

  it('Displays loading in start on page rendering', () => {
    mockCourseStatus = 'loading';
    render(
      <Route path="/course/:courseId/access-denied">
        <CourseAccessErrorPage />
      </Route>,
    );
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
    expect(history.location.pathname).toBe(accessDeniedUrl);
  });

  it('Redirect user to homepage if user has access', () => {
    mockCourseStatus = 'loaded';
    render(
      <Route path="/course/:courseId/access-denied">
        <CourseAccessErrorPage />
      </Route>,
    );
    expect(history.location.pathname).toBe('/redirect/home/course-v1:edX+DemoX+Demo_Course');
  });

  it('For access denied it should render access denied page', () => {
    mockCourseStatus = 'denied';

    render(
      <Route path="/course/:courseId/access-denied">
        <CourseAccessErrorPage />
      </Route>,
    );
    expect(screen.getByTestId('access-denied-main')).toBeInTheDocument();
    expect(history.location.pathname).toBe(accessDeniedUrl);
  });
});
