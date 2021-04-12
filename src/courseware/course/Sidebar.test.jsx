import React from 'react';
import { Factory } from 'rosie';
import {
  render, initializeTestStore, screen, fireEvent, waitFor,
} from '../../setupTest';
import Sidebar from './Sidebar';
import useWindowSize from '../../generic/tabs/useWindowSize';

jest.mock('../../generic/tabs/useWindowSize');

describe('Sidebar', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');

  beforeEach(async () => {
    mockData = {
      toggleSidebar: () => {},
    };
  });

  beforeAll(async () => {
    await initializeTestStore({ courseMetadata, excludeFetchCourse: true, excludeFetchSequence: true });
  });

  it('renders sidebar', async () => {
    useWindowSize.mockReturnValue({ width: 1200, height: 422 });
    const { container } = render(<Sidebar {...mockData} />);

    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('Notifications');
    expect(container).not.toHaveTextContent('Back to course');
  });

  it('renders no notifications message', async () => {
    // REV-2130 TODO: add conditional if no expiration box/upgradeable
    const testData = { ...mockData };
    const { container } = render(<Sidebar {...testData} />);

    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('You have no new notifications at this time.');
  });

  it('renders sidebar with full screen "Back to course" at response width', async () => {
    useWindowSize.mockReturnValue({ width: 991, height: 422 });
    const toggleSidebar = jest.fn();
    const testData = {
      ...mockData,
      toggleSidebar,
    };
    render(<Sidebar {...testData} />);

    const responsiveCloseButton = screen.getByRole('button', { name: 'Back to course' });
    await waitFor(() => expect(responsiveCloseButton).toBeInTheDocument());

    fireEvent.click(responsiveCloseButton);
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });
});
