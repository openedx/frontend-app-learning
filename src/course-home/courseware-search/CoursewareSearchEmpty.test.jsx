import React from 'react';
import {
  initializeMockApp,
  render,
  screen,
} from '../../setupTest';
import CoursewareSearchEmpty from './CoursewareSearchEmpty';
import messages from './messages';

function renderComponent() {
  const { container } = render(<CoursewareSearchEmpty />);
  return container;
}

describe('CoursewareSearchEmpty', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  it('render empty results text and corresponding classes', () => {
    renderComponent();
    const emptyText = screen.getByText(messages.searchResultsNone.defaultMessage);
    expect(emptyText).toBeInTheDocument();
    expect(emptyText).toHaveClass('courseware-search-results__empty');
    expect(emptyText).toHaveAttribute('data-testid', 'no-results');
    expect(emptyText.parentElement).toHaveClass('courseware-search-results');
  });
});
