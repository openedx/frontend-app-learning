import React from 'react';
import { history } from '@edx/frontend-platform';
import { Routes, Route } from 'react-router-dom';
import { initializeTestStore, render, screen } from '../setupTest';
import CourseAccessErrorPage from './CourseAccessErrorPage';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
let mockCourseStatus;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: () => ({ courseStatus: mockCourseStatus }),
}));
jest.mock('./PageLoading', () => function () {
  return <div data-testid="page-loading" />;
});
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

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
      <Routes>
        <Route path="/course/:courseId/access-denied" element={<CourseAccessErrorPage />} />
      </Routes>,
      { wrapWithRouter: true },
    );
    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
    expect(window.location.pathname).toBe(accessDeniedUrl);
  });

  it('Redirect user to homepage if user has access', () => {
    mockCourseStatus = 'loaded';
    render(
      <Routes>
        <Route path="/course/:courseId/access-denied" element={<CourseAccessErrorPage />} />
      </Routes>,
      { wrapWithRouter: true },
    );
    expect(window.location.pathname).toBe('/redirect/home/course-v1:edX+DemoX+Demo_Course');
  });

  it('For access denied it should render access denied page', () => {
    mockCourseStatus = 'denied';

    render(
      <Routes>
        <Route path="/course/:courseId/access-denied" element={<CourseAccessErrorPage />} />
      </Routes>,
      { wrapWithRouter: true },
    );
    expect(screen.getByTestId('access-denied-main')).toBeInTheDocument();
    expect(window.location.pathname).toBe(accessDeniedUrl);
  });
});
