import React from 'react';
import {
  act,
  initializeMockApp,
  render,
  screen,
  waitFor,
} from '../../setupTest';
import CoursewareSearchForm from './CoursewareSearchForm';

function renderComponent() {
  const { container } = render(<CoursewareSearchForm />);
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
