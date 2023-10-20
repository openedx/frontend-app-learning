import React from 'react';
import {
  act,
  initializeMockApp,
  render,
  screen,
  waitFor,
} from '../../setupTest';
import CoursewareSearchBar from './CoursewareSearchBar';

function renderComponent() {
  const { container } = render(<CoursewareSearchBar />);
  return container;
}

describe('CoursewareSearchToggle', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  it('should render', async () => {
    await act(async () => renderComponent());
    await waitFor(() => {
      expect(screen.queryByTestId('courseware-search-bar')).toBeInTheDocument();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
