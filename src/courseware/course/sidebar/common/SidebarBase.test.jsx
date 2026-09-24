import React from 'react';
import userEvent from '@testing-library/user-event';
import { breakpoints } from '@openedx/paragon';
import {
  fireEvent, initializeTestStore, render, screen,
} from '@src/setupTest';
import SidebarState from '@src/tests/SidebarState';
import { SidebarProvider } from '../SidebarContext';
import SidebarBase from './SidebarBase';

const courseId = 'course-v1:edX+Test+2024';
const unitId = 'unit-1';

const defaultProps = {
  title: 'Test Sidebar Title',
  ariaLabel: 'Test Sidebar',
  sidebarId: 'TEST_SIDEBAR',
  className: '',
  children: <div>Sidebar child content</div>,
};

const stubWidget = (id) => ({
  id,
  priority: 10,
  Sidebar: () => null,
  Trigger: () => null,
  isAvailable: () => true,
  enabled: true,
});

// The base renders under the provider with the stored sidebar open; the viewport decides the
// desktop or full-screen layout.
function renderSidebarBase(props = {}, { storedSidebar = 'TEST_SIDEBAR' } = {}) {
  window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify(storedSidebar));
  return render(
    <SidebarProvider courseId={courseId} unitId={unitId} widgets={[stubWidget('TEST_SIDEBAR'), stubWidget('OTHER_SIDEBAR')]}>
      <SidebarBase {...defaultProps} {...props} />
      <SidebarState />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );
}

const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

describe('SidebarBase', () => {
  const { innerWidth: originalInnerWidth } = window;

  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  beforeEach(() => {
    window.innerWidth = breakpoints.extraExtraLarge.minWidth;
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.localStorage.clear();
    window.sessionStorage.clear();
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
    const { container } = renderSidebarBase({}, { storedSidebar: 'OTHER_SIDEBAR' });
    const section = container.querySelector('[data-testid="sidebar-TEST_SIDEBAR"]');

    expect(section).toHaveClass('d-none');
  });

  it('does not add d-none class when currentSidebar matches sidebarId', () => {
    const { container } = renderSidebarBase();
    const section = container.querySelector('[data-testid="sidebar-TEST_SIDEBAR"]');

    expect(section).not.toHaveClass('d-none');
  });

  describe('desktop mode', () => {
    it('renders the sidebar title', () => {
      renderSidebarBase();

      expect(screen.getByText('Test Sidebar Title')).toBeInTheDocument();
    });

    it('renders the close button', () => {
      renderSidebarBase();

      expect(screen.getByRole('button', { name: /close sidebar/i })).toBeInTheDocument();
    });

    it('closes the sidebar when the close button is clicked', async () => {
      const user = userEvent.setup();
      renderSidebarBase();
      expect(currentSidebar()).toBe('TEST_SIDEBAR');

      await user.click(screen.getByRole('button', { name: /close sidebar/i }));

      expect(currentSidebar()).toBe('null');
    });

    it('does not render the back-to-course button', () => {
      renderSidebarBase();

      expect(screen.queryByText(/back to course/i)).not.toBeInTheDocument();
    });
  });

  describe('mobile mode', () => {
    beforeEach(() => {
      window.innerWidth = breakpoints.medium.maxWidth;
    });

    it('renders the "Back to course" back-navigation button', () => {
      renderSidebarBase();

      expect(screen.getByText(/back to course/i)).toBeInTheDocument();
    });

    it('closes the sidebar when the back-navigation button is clicked', async () => {
      const user = userEvent.setup();
      renderSidebarBase();
      expect(currentSidebar()).toBe('TEST_SIDEBAR');

      await user.click(screen.getByRole('button', { name: /back to course/i }));

      expect(currentSidebar()).toBe('null');
    });

    it('does not render the desktop close button', () => {
      renderSidebarBase();

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
    it('closes the sidebar when receiving learning.events.sidebar.close message', () => {
      renderSidebarBase();
      expect(currentSidebar()).toBe('TEST_SIDEBAR');

      fireEvent(
        window,
        new MessageEvent('message', { data: { type: 'learning.events.sidebar.close' } }),
      );

      expect(currentSidebar()).toBe('null');
    });

    it('ignores unrelated message types', () => {
      renderSidebarBase();

      fireEvent(
        window,
        new MessageEvent('message', { data: { type: 'some.other.event' } }),
      );

      expect(currentSidebar()).toBe('TEST_SIDEBAR');
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
