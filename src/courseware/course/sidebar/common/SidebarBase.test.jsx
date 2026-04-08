import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarContext from '../SidebarContext';
import SidebarBase from './SidebarBase';

const mockToggleSidebar = jest.fn();

const defaultContextValue = {
  toggleSidebar: mockToggleSidebar,
  shouldDisplayFullScreen: false,
  currentSidebar: 'TEST_SIDEBAR',
};

const defaultProps = {
  title: 'Test Sidebar Title',
  ariaLabel: 'Test Sidebar',
  sidebarId: 'TEST_SIDEBAR',
  className: '',
  children: <div>Sidebar child content</div>,
};

function renderSidebarBase(props = {}, contextValue = {}) {
  const mergedContext = { ...defaultContextValue, ...contextValue };
  return render(
    <IntlProvider locale="en">
      <SidebarContext.Provider value={mergedContext}>
        <SidebarBase {...defaultProps} {...props} />
      </SidebarContext.Provider>
    </IntlProvider>,
  );
}

describe('SidebarBase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when currentSidebar matches sidebarId', () => {
    renderSidebarBase();

    expect(screen.getByText('Sidebar child content')).toBeInTheDocument();
  });

  it('renders the sidebar section with correct data-testid', () => {
    const { container } = renderSidebarBase();

    expect(container.querySelector('[data-testid="sidebar-TEST_SIDEBAR"]')).toBeInTheDocument();
  });

  it('adds d-none class when currentSidebar does not match sidebarId', () => {
    const { container } = renderSidebarBase({}, { currentSidebar: 'OTHER_SIDEBAR' });
    const section = container.querySelector('[data-testid="sidebar-TEST_SIDEBAR"]');

    expect(section).toHaveClass('d-none');
  });

  it('does not add d-none class when currentSidebar matches sidebarId', () => {
    const { container } = renderSidebarBase();
    const section = container.querySelector('[data-testid="sidebar-TEST_SIDEBAR"]');

    expect(section).not.toHaveClass('d-none');
  });

  describe('desktop mode (shouldDisplayFullScreen=false)', () => {
    it('renders the sidebar title', () => {
      renderSidebarBase();

      expect(screen.getByText('Test Sidebar Title')).toBeInTheDocument();
    });

    it('renders the close button', () => {
      renderSidebarBase();

      expect(screen.getByRole('button', { name: /close sidebar/i })).toBeInTheDocument();
    });

    it('calls toggleSidebar(null) when close button is clicked', () => {
      renderSidebarBase();
      fireEvent.click(screen.getByRole('button', { name: /close sidebar/i }));

      expect(mockToggleSidebar).toHaveBeenCalledWith(null);
    });

    it('does not render the back-to-course button', () => {
      renderSidebarBase();

      expect(screen.queryByText(/back to course/i)).not.toBeInTheDocument();
    });
  });

  describe('mobile mode (shouldDisplayFullScreen=true)', () => {
    it('renders the "Back to course" back-navigation button', () => {
      renderSidebarBase({}, { shouldDisplayFullScreen: true });

      expect(screen.getByText(/back to course/i)).toBeInTheDocument();
    });

    it('calls toggleSidebar(null) when back-navigation button is clicked', () => {
      renderSidebarBase({}, { shouldDisplayFullScreen: true });
      fireEvent.click(screen.getByRole('button', { name: /back to course/i }));

      expect(mockToggleSidebar).toHaveBeenCalledWith(null);
    });

    it('does not render the desktop close button', () => {
      renderSidebarBase({}, { shouldDisplayFullScreen: true });

      expect(screen.queryByRole('button', { name: /close sidebar/i })).not.toBeInTheDocument();
    });
  });

  describe('showTitleBar prop', () => {
    it('hides title and close button when showTitleBar=false', () => {
      renderSidebarBase({ showTitleBar: false });

      expect(screen.queryByText('Test Sidebar Title')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /close sidebar/i })).not.toBeInTheDocument();
    });

    it('shows title bar by default when showTitleBar is not specified', () => {
      renderSidebarBase();

      expect(screen.getByText('Test Sidebar Title')).toBeInTheDocument();
    });
  });

  describe('postMessage event handling', () => {
    it('calls toggleSidebar(null) when receiving learning.events.sidebar.close message', () => {
      renderSidebarBase();
      fireEvent(
        window,
        new MessageEvent('message', { data: { type: 'learning.events.sidebar.close' } }),
      );

      expect(mockToggleSidebar).toHaveBeenCalledWith(null);
    });

    it('does not call toggleSidebar for unrelated message types', () => {
      renderSidebarBase();
      fireEvent(
        window,
        new MessageEvent('message', { data: { type: 'some.other.event' } }),
      );

      expect(mockToggleSidebar).not.toHaveBeenCalled();
    });
  });

  describe('width prop', () => {
    it('applies custom width to the section element in desktop mode', () => {
      const { container } = renderSidebarBase({ width: '50rem' });
      const section = container.querySelector('[data-testid="sidebar-TEST_SIDEBAR"]');

      expect(section.style.width).toBe('50rem');
    });
  });
});
