import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import SidebarContext from './SidebarContext';

const MockDiscussionsPanel = () => <div data-testid="discussions-panel">Discussions Content</div>;
const MockNotesPanel = () => <div data-testid="notes-panel">Notes Content</div>;

const defaultContextValue = {
  currentSidebar: null,
  initialSidebar: null,
  toggleSidebar: jest.fn(),
  shouldDisplaySidebarOpen: false,
  shouldDisplayFullScreen: false,
  courseId: 'course-v1:edX+Test+2024',
  unitId: 'unit-1',
  SIDEBARS: {
    DISCUSSIONS: { Sidebar: MockDiscussionsPanel },
    NOTES: { Sidebar: MockNotesPanel },
  },
  SIDEBAR_ORDER: ['DISCUSSIONS', 'NOTES'],
  availableSidebarIds: ['DISCUSSIONS', 'NOTES'],
};

function renderSidebar(contextOverrides = {}) {
  const contextValue = { ...defaultContextValue, ...contextOverrides };
  return render(
    <SidebarContext.Provider value={contextValue}>
      <Sidebar />
    </SidebarContext.Provider>,
  );
}

describe('Sidebar', () => {
  describe('Unit tests: rendering logic', () => {
    it('renders null when currentSidebar is null', () => {
      const { container } = renderSidebar({ currentSidebar: null });
      expect(container.innerHTML).toBe('');
    });

    it('renders null when SIDEBARS is null', () => {
      const { container } = renderSidebar({ currentSidebar: 'DISCUSSIONS', SIDEBARS: null });
      expect(container.innerHTML).toBe('');
    });

    it('renders null when SIDEBARS is undefined', () => {
      const { container } = renderSidebar({ currentSidebar: 'DISCUSSIONS', SIDEBARS: undefined });
      expect(container.innerHTML).toBe('');
    });

    it('renders null when SIDEBARS is an empty object', () => {
      const { container } = renderSidebar({ currentSidebar: 'DISCUSSIONS', SIDEBARS: {} });
      expect(container.innerHTML).toBe('');
    });

    it('renders null when currentSidebar does not exist in SIDEBARS', () => {
      const { container } = renderSidebar({ currentSidebar: 'NONEXISTENT' });
      expect(container.innerHTML).toBe('');
    });

    it('renders the correct sidebar component when currentSidebar matches a key in SIDEBARS', () => {
      renderSidebar({ currentSidebar: 'DISCUSSIONS' });
      expect(screen.getByTestId('discussions-panel')).toBeInTheDocument();
      expect(screen.getByText('Discussions Content')).toBeInTheDocument();
    });

    it('renders a different sidebar when currentSidebar changes', () => {
      renderSidebar({ currentSidebar: 'NOTES' });
      expect(screen.getByTestId('notes-panel')).toBeInTheDocument();
      expect(screen.getByText('Notes Content')).toBeInTheDocument();
    });
  });

  describe('Functional tests: widget switching', () => {
    it('switches from one sidebar to another on re-render', () => {
      const { rerender } = render(
        <SidebarContext.Provider value={{ ...defaultContextValue, currentSidebar: 'DISCUSSIONS' }}>
          <Sidebar />
        </SidebarContext.Provider>,
      );

      expect(screen.getByTestId('discussions-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('notes-panel')).not.toBeInTheDocument();

      rerender(
        <SidebarContext.Provider value={{ ...defaultContextValue, currentSidebar: 'NOTES' }}>
          <Sidebar />
        </SidebarContext.Provider>,
      );

      expect(screen.getByTestId('notes-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
    });

    it('hides sidebar when currentSidebar changes from a valid value to null', () => {
      const { rerender } = render(
        <SidebarContext.Provider value={{ ...defaultContextValue, currentSidebar: 'DISCUSSIONS' }}>
          <Sidebar />
        </SidebarContext.Provider>,
      );

      expect(screen.getByTestId('discussions-panel')).toBeInTheDocument();

      rerender(
        <SidebarContext.Provider value={{ ...defaultContextValue, currentSidebar: null }}>
          <Sidebar />
        </SidebarContext.Provider>,
      );

      expect(screen.queryByTestId('discussions-panel')).not.toBeInTheDocument();
    });

    it('shows sidebar when currentSidebar changes from null to a valid value', () => {
      const { container, rerender } = render(
        <SidebarContext.Provider value={{ ...defaultContextValue, currentSidebar: null }}>
          <Sidebar />
        </SidebarContext.Provider>,
      );

      expect(container.innerHTML).toBe('');

      rerender(
        <SidebarContext.Provider value={{ ...defaultContextValue, currentSidebar: 'NOTES' }}>
          <Sidebar />
        </SidebarContext.Provider>,
      );

      expect(screen.getByTestId('notes-panel')).toBeInTheDocument();
    });

    it('renders COURSE_OUTLINE as null when it is not in SIDEBARS registry', () => {
      const { container } = renderSidebar({ currentSidebar: 'COURSE_OUTLINE' });
      expect(container.innerHTML).toBe('');
    });

    it('only renders one sidebar at a time', () => {
      renderSidebar({ currentSidebar: 'DISCUSSIONS' });

      expect(screen.getByTestId('discussions-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('notes-panel')).not.toBeInTheDocument();
    });
  });
});
