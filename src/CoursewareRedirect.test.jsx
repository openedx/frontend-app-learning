import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import CoursewareRedirect from './CoursewareRedirect';
import { render, screen, initializeMockApp } from './setupTest';

describe('Courseware Redirect', () => {
  // Copy `window.location`, so it can be restored after each test. It's redundant, but future-proof.
  const { location } = window;
  // Instead of mocking `useRouteMatch` we can provide a default initial path for tests.
  const path = '/';

  beforeAll(async () => {
    // We need to mock AuthService to implicitly use `getAuthenticatedUser` within `AppContext.Provider`.
    await initializeMockApp();
  });

  beforeEach(() => {
    delete window.location;
    window.location = {
      assign: jest.fn(),
    };
  });

  afterEach(() => {
    window.location = location;
  });

  it('displays message while redirecting or when path has not been found', () => {
    render(<CoursewareRedirect />);
    expect(screen.getByRole('status')).toHaveTextContent('Redirecting...');
    expect(global.location.assign).not.toHaveBeenCalled();
  });

  it('redirects to course page', () => {
    const courseId = 'test-course-id';
    const testPath = `/course-home/${courseId}`;
    const expectedPath = `/courses/${courseId}/course/`;
    render(
      <MemoryRouter initialEntries={[`${path}${testPath}`]}>
        <CoursewareRedirect />
      </MemoryRouter>,
    );

    expect(global.location.assign).toHaveBeenCalledWith(`${getConfig().LMS_BASE_URL}${expectedPath}`);
  });

  it('redirects to the dashboard and passes search property', () => {
    const testPath = '/dashboard?search';
    render(
      <MemoryRouter initialEntries={[`${path}${testPath}`]}>
        <CoursewareRedirect />
      </MemoryRouter>,
    );

    expect(global.location.assign).toHaveBeenCalledWith(`${getConfig().LMS_BASE_URL}${testPath}`);
  });
});
