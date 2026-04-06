import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen, fireEvent } from '@testing-library/react';
import { getConfig } from '@edx/frontend-platform';
import SidebarContext from './SidebarContext';
import SidebarTriggers from './SidebarTriggers';
import {
  getEnabledWidgets,
  buildSidebarsRegistry,
  getSidebarOrder,
} from './defaultWidgets';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({})),
}));

jest.mock('@src/widgets/discussions/widgetConfig', () => ({
  discussionsWidgetConfig: {
    id: 'DISCUSSIONS',
    priority: 10,
    Sidebar: () => null,
    Trigger: () => <button type="button" data-testid="trigger-DISCUSSIONS">Discussions</button>,
    isAvailable: jest.fn(),
    enabled: true,
  },
}));

const mockToggleSidebar = jest.fn();
// eslint-disable-next-line react/prop-types
const MockTriggerA = ({ onClick }) => (
  <button type="button" onClick={onClick} data-testid="trigger-A">Trigger A</button>
);
// eslint-disable-next-line react/prop-types
const MockTriggerB = ({ onClick }) => (
  <button type="button" onClick={onClick} data-testid="trigger-B">Trigger B</button>
);

function buildContext(overrides = {}) {
  return {
    toggleSidebar: mockToggleSidebar,
    currentSidebar: null,
    availableSidebarIds: ['WIDGET_A', 'WIDGET_B'],
    SIDEBAR_ORDER: ['WIDGET_A', 'WIDGET_B'],
    SIDEBARS: {
      WIDGET_A: { Trigger: MockTriggerA },
      WIDGET_B: { Trigger: MockTriggerB },
    },
    ...overrides,
  };
}

function renderTriggers(contextOverrides = {}) {
  return render(
    <IntlProvider locale="en">
      <SidebarContext.Provider value={buildContext(contextOverrides)}>
        <SidebarTriggers />
      </SidebarContext.Provider>
    </IntlProvider>,
  );
}

describe('SidebarTriggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders a trigger for each widget in SIDEBAR_ORDER', () => {
      renderTriggers();

      expect(screen.getByTestId('trigger-A')).toBeInTheDocument();
      expect(screen.getByTestId('trigger-B')).toBeInTheDocument();
    });

    it('renders nothing when SIDEBAR_ORDER is empty', () => {
      const { container } = renderTriggers({ SIDEBAR_ORDER: [], SIDEBARS: {} });

      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when SIDEBAR_ORDER is null', () => {
      const { container } = renderTriggers({ SIDEBAR_ORDER: null, SIDEBARS: {} });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('active state styling', () => {
    it('applies active class to the currently open sidebar trigger', () => {
      const { container } = renderTriggers({ currentSidebar: 'WIDGET_A' });
      const triggerWrappers = container.querySelectorAll('[class*="sidebar-active"]');

      expect(triggerWrappers).toHaveLength(1);
    });

    it('applies no active class when no sidebar is open', () => {
      const { container } = renderTriggers({ currentSidebar: null });
      const activeWrappers = container.querySelectorAll('[class*="sidebar-active"]');

      expect(activeWrappers).toHaveLength(0);
    });

    it('applies active class to WIDGET_B when WIDGET_B is open', () => {
      renderTriggers({ currentSidebar: 'WIDGET_B' });

      const triggerB = screen.getByTestId('trigger-B');
      expect(triggerB.closest('[class*="sidebar-active"]')).toBeInTheDocument();
    });
  });

  describe('click interactions (Use Case 7: Manual Toggle)', () => {
    it('calls toggleSidebar with the widget ID when a trigger is clicked', () => {
      renderTriggers();

      fireEvent.click(screen.getByTestId('trigger-A'));
      expect(mockToggleSidebar).toHaveBeenCalledWith('WIDGET_A');
    });

    it('calls toggleSidebar with correct ID for each trigger', () => {
      renderTriggers();

      fireEvent.click(screen.getByTestId('trigger-B'));
      expect(mockToggleSidebar).toHaveBeenCalledWith('WIDGET_B');
    });

    it('calls toggleSidebar even when that sidebar is already open (toggle-to-close)', () => {
      renderTriggers({ currentSidebar: 'WIDGET_A' });

      fireEvent.click(screen.getByTestId('trigger-A'));
      expect(mockToggleSidebar).toHaveBeenCalledWith('WIDGET_A');
    });
  });
});

describe('SidebarTriggers - external widget integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({});
  });

  it('registers an external widget and renders its trigger on screen', () => {
    const ExternalTrigger = () => (
      <button type="button" data-testid="trigger-DUMMY_WIDGET">Dummy Widget</button>
    );
    getConfig.mockReturnValue({
      SIDEBAR_WIDGETS: [{
        id: 'DUMMY_WIDGET',
        priority: 30,
        Sidebar: () => <div>Dummy Sidebar</div>,
        Trigger: ExternalTrigger,
        isAvailable: () => true,
        enabled: true,
      }],
    });

    const widgets = getEnabledWidgets();
    const SIDEBARS = buildSidebarsRegistry(widgets);
    const SIDEBAR_ORDER = getSidebarOrder(widgets);

    render(
      <IntlProvider locale="en">
        <SidebarContext.Provider value={{
          toggleSidebar: jest.fn(),
          currentSidebar: null,
          availableSidebarIds: SIDEBAR_ORDER,
          SIDEBARS,
          SIDEBAR_ORDER,
        }}
        >
          <SidebarTriggers />
        </SidebarContext.Provider>
      </IntlProvider>,
    );

    expect(screen.getByTestId('trigger-DUMMY_WIDGET')).toBeInTheDocument();
    expect(screen.getByText('Dummy Widget')).toBeVisible();
  });

  it('does not render a trigger for an external widget with enabled: false', () => {
    getConfig.mockReturnValue({
      SIDEBAR_WIDGETS: [{
        id: 'HIDDEN_WIDGET',
        priority: 30,
        Sidebar: () => null,
        Trigger: () => <button type="button" data-testid="trigger-HIDDEN_WIDGET">Hidden</button>,
        enabled: false,
      }],
    });

    const widgets = getEnabledWidgets();
    const SIDEBARS = buildSidebarsRegistry(widgets);
    const SIDEBAR_ORDER = getSidebarOrder(widgets);

    render(
      <IntlProvider locale="en">
        <SidebarContext.Provider value={{
          toggleSidebar: jest.fn(),
          currentSidebar: null,
          availableSidebarIds: SIDEBAR_ORDER,
          SIDEBARS,
          SIDEBAR_ORDER,
        }}
        >
          <SidebarTriggers />
        </SidebarContext.Provider>
      </IntlProvider>,
    );

    expect(screen.queryByTestId('trigger-HIDDEN_WIDGET')).not.toBeInTheDocument();
  });

  it('clicking an external widget trigger calls toggleSidebar with its ID', () => {
    const toggleSidebar = jest.fn();
    // eslint-disable-next-line react/prop-types
    const ExternalTrigger = ({ onClick }) => (
      <button type="button" data-testid="trigger-DUMMY_WIDGET" onClick={onClick}>Dummy Widget</button>
    );
    getConfig.mockReturnValue({
      SIDEBAR_WIDGETS: [{
        id: 'DUMMY_WIDGET',
        priority: 30,
        Sidebar: () => null,
        Trigger: ExternalTrigger,
        enabled: true,
      }],
    });

    const widgets = getEnabledWidgets();
    const SIDEBARS = buildSidebarsRegistry(widgets);
    const SIDEBAR_ORDER = getSidebarOrder(widgets);

    render(
      <IntlProvider locale="en">
        <SidebarContext.Provider value={{
          toggleSidebar,
          currentSidebar: null,
          availableSidebarIds: SIDEBAR_ORDER,
          SIDEBARS,
          SIDEBAR_ORDER,
        }}
        >
          <SidebarTriggers />
        </SidebarContext.Provider>
      </IntlProvider>,
    );

    fireEvent.click(screen.getByTestId('trigger-DUMMY_WIDGET'));
    expect(toggleSidebar).toHaveBeenCalledWith('DUMMY_WIDGET');
  });
});
