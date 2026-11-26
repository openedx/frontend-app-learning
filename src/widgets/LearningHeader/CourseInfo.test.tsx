import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { courseHomeMetaQuery } from '@src/course-home/data/apiHooks';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';

import CourseInfo from './CourseInfo';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

// The widget renders in the shell's header: a layout route above the page, not inside it.
const renderInHeader = (metadata?: Record<string, unknown>) => {
  const queryClient = createTestQueryClient();
  if (metadata) {
    seedQueryData(queryClient, courseHomeMetaQuery(courseId).queryKey, metadata);
  }
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/learning/course/${courseId}/home`]}>
        <Routes>
          <Route element={<><header><CourseInfo /></header><Outlet /></>}>
            <Route path="/learning/course/:courseId/home" element={<main />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { ...result, queryClient };
};

describe('CourseInfo', () => {
  it('shows the org and number on one line and the title beneath, from the course in the page route', () => {
    renderInHeader({ org: 'edX', number: 'DemoX', title: 'Demonstration Course' });

    expect(screen.getByText('edX DemoX')).toHaveClass('d-block', 'small');
    expect(screen.getByText('Demonstration Course')).toHaveClass('d-block', 'font-weight-bold');
  });

  it('renders nothing and requests nothing while the frame has not loaded the metadata', () => {
    const { container, queryClient } = renderInHeader();

    expect(container.querySelector('header')).toBeEmptyDOMElement();
    expect(queryClient.getQueryState(courseHomeMetaQuery(courseId).queryKey)?.fetchStatus).toBe('idle');
  });
});
