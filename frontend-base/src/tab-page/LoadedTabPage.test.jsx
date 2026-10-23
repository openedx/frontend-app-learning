import React from 'react';
import { Factory } from 'rosie';
import { camelCaseObject, getLoggingService } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { act, screen, waitFor } from '@testing-library/react';

import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';
import { render } from '@src/tests/render';
import LoadedTabPage from './LoadedTabPage';

jest.mock('../instructor-toolbar/InstructorToolbar', () => function InstructorToolbar() {
  return <div data-testid="InstructorToolbar" />;
});
jest.mock('../product-tours/ProductTours', () => function ProductTours() {
  return <div data-testid="ProductTours" />;
});

describe('Loaded Tab Page', () => {
  const mockData = { activeTabSlug: 'courseware' };

  function renderWithMetadata(courseHomeMetadata, props = {}, { children = null } = {}) {
    const queryClient = createTestQueryClient();
    seedQueryData(
      queryClient,
      courseHomeMetaQuery(courseHomeMetadata.id).queryKey,
      camelCaseObject(courseHomeMetadata),
    );
    return render(
      <QueryClientProvider client={queryClient}>
        <LoadedTabPage {...mockData} courseId={courseHomeMetadata.id} {...props}>
          {children}
        </LoadedTabPage>
      </QueryClientProvider>,
    );
  }

  it('renders correctly', async () => {
    renderWithMetadata(Factory.build('courseHomeMetadata'));

    await waitFor(() => {
      expect(document.title).toBe('Course | Demonstration Course | Learning Test Site');
    });
    expect(screen.queryByTestId('InstructorToolbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows Instructor Toolbar if original user is staff', () => {
    renderWithMetadata(Factory.build('courseHomeMetadata', { original_user_is_staff: true }));

    expect(screen.getByTestId('InstructorToolbar')).toBeInTheDocument();
  });

  // https://github.com/openedx/frontend-app-learning/issues/2201
  it.skip('shows streak celebration modal', async () => {
    const courseHomeMetadata = Factory.build('courseHomeMetadata', { celebrations: { streak_length_to_celebrate: 3 } });
    await act(async () => renderWithMetadata(courseHomeMetadata));
    expect(screen.getByRole('dialog')).toHaveTextContent('3 day streak');
  });

  it('throws when rendered before the course metadata has loaded', () => {
    // jsdom reports the caught render error on console.error; silence it, not the assertion.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <LoadedTabPage {...mockData} courseId="course-v1:edX+DemoX+Demo_Course" />
      </QueryClientProvider>,
    );

    expect(getLoggingService().logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'LoadedTabPage rendered without course metadata for course-v1:edX+DemoX+Demo_Course',
      }),
      expect.anything(),
    );

    consoleError.mockRestore();
  });

  describe('landmark structure', () => {
    it('for the courseware tab, does not render a <main> wrapper here (Sequence renders <main> instead)', () => {
      renderWithMetadata(Factory.build('courseHomeMetadata'), { activeTabSlug: 'courseware' });

      // No <main> is emitted from LoadedTabPage — the courseware Sequence provides it.
      expect(document.querySelector('main')).not.toBeInTheDocument();
    });

    it('for non-courseware tabs, the <main> landmark wraps the page children', () => {
      renderWithMetadata(
        Factory.build('courseHomeMetadata'),
        { activeTabSlug: 'outline' },
        { children: <button type="button">Tab content</button> },
      );

      const mainLandmark = screen.getByRole('main');

      expect(mainLandmark).toContainElement(screen.getByRole('button', { name: /tab content/i }));
    });
  });
});
