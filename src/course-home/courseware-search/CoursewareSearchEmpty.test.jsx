import React from 'react';
import {
  screen,
} from '@testing-library/react';
import { render } from '@src/tests/render';
import CoursewareSearchEmpty from './CoursewareSearchEmpty';
import messages from './messages';

function renderComponent() {
  const { container } = render(<CoursewareSearchEmpty />);
  return container;
}

describe('CoursewareSearchEmpty', () => {

  it('render empty results text and corresponding classes', () => {
    renderComponent();
    const emptyText = screen.getByText(messages.searchResultsNone.defaultMessage);
    expect(emptyText).toBeInTheDocument();
    expect(emptyText).toHaveClass('courseware-search-results__empty');
    expect(emptyText).toHaveAttribute('data-testid', 'no-results');
    expect(emptyText.parentElement).toHaveClass('courseware-search-results');
  });
});
