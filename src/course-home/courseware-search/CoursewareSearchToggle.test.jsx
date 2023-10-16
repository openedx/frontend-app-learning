import React from 'react';
import {
  act,
  initializeMockApp,
  render,
  screen,
  waitFor,
} from '../../setupTest';
import { fetchCoursewareSearchSettings } from '../data/thunks';
import { CoursewareSearchToggle } from './index';

jest.mock('../data/thunks');

function renderComponent() {
  const { container } = render(<CoursewareSearchToggle />);
  return container;
}

describe('CoursewareSearchToggle', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should not render when the waffle flag is disabled', async () => {
    fetchCoursewareSearchSettings.mockImplementation(() => Promise.resolve({ enabled: false }));

    await act(async () => renderComponent());
    await waitFor(() => {
      expect(fetchCoursewareSearchSettings).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('courseware-search-button')).not.toBeInTheDocument();
    });
  });

  it('Should render when the waffle flag is enabled', async () => {
    fetchCoursewareSearchSettings.mockImplementation(() => Promise.resolve({ enabled: true }));
    await act(async () => renderComponent());
    await waitFor(() => {
      expect(fetchCoursewareSearchSettings).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('courseware-search-button')).toBeInTheDocument();
    });
  });
});
