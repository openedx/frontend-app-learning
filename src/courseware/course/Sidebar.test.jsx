import React from 'react';
import { Factory } from 'rosie';
import {
  render, initializeTestStore, screen, fireEvent, waitFor,
} from '../../setupTest';
import Sidebar from './Sidebar';

describe('Sidebar', () => {
  let mockData;
  const courseMetadata = Factory.build('courseMetadata');

  beforeEach(async () => {
    mockData = {
      sidebarVisible: false,
      toggleSidebar: () => {},
      shouldDisplayFullScreen: false,
    };
  });

  it('renders sidebar', async () => {
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    const testData = { ...mockData, sidebarVisible: true };
    const { container } = render(<Sidebar {...testData} />, { store: testStore });

    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('Notifications');
  });

  it('renders sidebar and mobile close button at responsive width', async () => {
    const sidebarVisible = true;
    const shouldDisplayFullScreen = true;
    const toggleSidebar = jest.fn();
    const testStore = await initializeTestStore({ courseMetadata, excludeFetchSequence: true }, false);
    const testData = {
      ...mockData,
      sidebarVisible,
      shouldDisplayFullScreen,
      toggleSidebar,
    };
    render(<Sidebar {...testData} />, { store: testStore });

    const responsiveCloseButton = screen.getByRole('button', { name: 'Back to course' });
    await waitFor(() => expect(responsiveCloseButton).toBeInTheDocument());

    fireEvent.click(responsiveCloseButton);
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });
});
