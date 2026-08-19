import React from 'react';
import { history } from '@edx/frontend-platform';
import { Routes, Route } from 'react-router-dom';
import { initializeTestStore, render, screen } from '../setupTest';
import CourseAccessErrorPage from './CourseAccessErrorPage';

let mockMetadataQuery;

jest.mock('../course-home/data/apiHooks', () => ({
  useCourseHomeMeta: () => mockMetadataQuery,
}));
jest.mock('./PageLoading', () => function () {
  return <div data-testid="page-loading" />;
});

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
    mockMetadataQuery = { isPending: true, data: undefined };
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
    mockMetadataQuery = { isPending: false, data: { courseAccess: { hasAccess: true } } };
    render(
      <Routes>
        <Route path="/course/:courseId/access-denied" element={<CourseAccessErrorPage />} />
      </Routes>,
      { wrapWithRouter: true },
    );
    expect(window.location.pathname).toBe('/redirect/home/course-v1:edX+DemoX+Demo_Course');
  });

  it('For access denied it should render access denied page', () => {
    mockMetadataQuery = { isPending: false, data: { courseAccess: { hasAccess: false } } };

    render(
      <Routes>
        <Route path="/course/:courseId/access-denied" element={<CourseAccessErrorPage />} />
      </Routes>,
      { wrapWithRouter: true },
    );
    expect(screen.getByTestId('access-denied-main')).toBeInTheDocument();
    expect(window.location.pathname).toBe(accessDeniedUrl);
  });

  it('For a failed metadata query it should render access denied page', () => {
    mockMetadataQuery = { isPending: false, isError: true, data: undefined };

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
