import { IntlProvider } from '@openedx/frontend-base';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent, render, screen, within,
} from '@testing-library/react';
import { type ComponentType } from 'react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';

import { coursewareSearchEnabledQuery, coursewareSearchResultsQuery } from '@src/course-home/courseware-search/data/apiHooks';
import searchResultsFactory from '@src/course-home/courseware-search/test-data/search-results-factory';
import { createTestQueryClient, seedQueryData } from '@src/tests/queryClient';

import { LazyCoursewareSearchWidget } from './app';
import CoursewareSearchWidget from './CoursewareSearchWidget';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

// jsdom has neither <dialog> behavior nor scrolling.
HTMLDialogElement.prototype.showModal = jest.fn();
HTMLDialogElement.prototype.close = jest.fn(function close(this: HTMLDialogElement) {
  this.dispatchEvent(new Event('close'));
});
window.scrollTo = jest.fn();

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// The widget renders in the shell's course bar: a layout route above the page, outside Learning's Main.
const renderInCourseBar = (
  { enabled, search = '', Widget = CoursewareSearchWidget }: { enabled: boolean; search?: string; Widget?: ComponentType },
) => {
  const queryClient = createTestQueryClient();
  seedQueryData(queryClient, coursewareSearchEnabledQuery(courseId).queryKey, { enabled });
  seedQueryData(queryClient, coursewareSearchResultsQuery(courseId, 'demo').queryKey, searchResultsFactory('demo'));
  return render(
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/learning/course/${courseId}/home${search}`]}>
          <Routes>
            <Route element={<><nav><Widget /></nav><Outlet /></>}>
              <Route path="/learning/course/:courseId/home" element={<main />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>,
  );
};

describe('CoursewareSearchWidget', () => {
  it('renders nothing when search is not enabled for the course', () => {
    const { container } = renderInCourseBar({ enabled: false });

    expect(container.querySelector('nav')).toBeEmptyDOMElement();
  });

  it('shows the search button, which opens the panel', () => {
    renderInCourseBar({ enabled: true });
    expect(screen.queryByTestId('courseware-search-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('courseware-search-open-button'));

    expect(screen.getByTestId('courseware-search-dialog')).toBeInTheDocument();
    expect(document.body).toHaveClass('_search-no-scroll');
  });

  it('opens the panel on load with the results of a search in the URL', () => {
    renderInCourseBar({ enabled: true, search: '?q=demo' });

    const results = screen.getByTestId('courseware-search-results');
    expect(within(results).getByTestId('courseware-search-summary')).toHaveTextContent('Results for "demo":');
  });

  it('closes the panel and clears the search', () => {
    renderInCourseBar({ enabled: true, search: '?q=demo' });

    fireEvent.click(screen.getByTestId('courseware-search-close-button'));

    expect(screen.queryByTestId('courseware-search-dialog')).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass('_search-no-scroll');
  });

  it('loads lazily from the slot operation', async () => {
    renderInCourseBar({ enabled: true, Widget: LazyCoursewareSearchWidget });

    expect(await screen.findByTestId('courseware-search-open-button')).toBeInTheDocument();
  });
});
