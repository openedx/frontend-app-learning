import React from 'react';
import userEvent from '@testing-library/user-event';
import { mergeConfig } from '@edx/frontend-platform';
import { initializeTestStore, render, screen } from '@src/setupTest';
import SidebarState from '@src/tests/SidebarState';
import { getEnabledWidgets } from './defaultWidgets';
import { SidebarProvider } from './SidebarContext';
import SidebarTriggers from './SidebarTriggers';

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

jest.mock('@src/widgets/upgrade/src/widgetConfig', () => ({
  upgradeWidgetConfig: {
    id: 'UPGRADE',
    priority: 20,
    Sidebar: () => null,
    Trigger: () => <button type="button" data-testid="trigger-UPGRADE">Upgrade</button>,
    isAvailable: jest.fn(),
    enabled: true,
  },
}));

const courseId = 'course-v1:edX+Test+2024';
const unitId = 'unit-1';

// eslint-disable-next-line react/prop-types
const MockTriggerA = ({ onClick }) => (
  <button type="button" onClick={onClick} data-testid="trigger-A">Trigger A</button>
);
// eslint-disable-next-line react/prop-types
const MockTriggerB = ({ onClick }) => (
  <button type="button" onClick={onClick} data-testid="trigger-B">Trigger B</button>
);

const stubWidget = (id, priority, Trigger, overrides = {}) => ({
  id,
  priority,
  Sidebar: () => null,
  Trigger,
  isAvailable: () => true,
  enabled: true,
  ...overrides,
});

const defaultWidgets = [stubWidget('WIDGET_A', 10, MockTriggerA), stubWidget('WIDGET_B', 20, MockTriggerB)];

function renderTriggers(widgets = defaultWidgets) {
  return render(
    <SidebarProvider courseId={courseId} unitId={unitId} widgets={widgets}>
      <SidebarTriggers />
      <SidebarState />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );
}

const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

describe('SidebarTriggers', () => {
  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('rendering', () => {
    it('renders a trigger for each available widget', () => {
      renderTriggers();

      expect(screen.getByTestId('trigger-A')).toBeInTheDocument();
      expect(screen.getByTestId('trigger-B')).toBeInTheDocument();
    });

    it('renders no trigger for a widget that is not available', () => {
      renderTriggers([
        stubWidget('WIDGET_A', 10, MockTriggerA),
        stubWidget('WIDGET_B', 20, MockTriggerB, { isAvailable: () => false }),
      ]);

      expect(screen.getByTestId('trigger-A')).toBeInTheDocument();
      expect(screen.queryByTestId('trigger-B')).not.toBeInTheDocument();
    });

    it('renders nothing when no widgets are registered', () => {
      renderTriggers([]);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('active state styling', () => {
    it('applies active class to the currently open sidebar trigger', () => {
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_A'));
      const { container } = renderTriggers();
      const triggerWrappers = container.querySelectorAll('[class*="sidebar-active"]');

      expect(triggerWrappers).toHaveLength(1);
      expect(screen.getByTestId('trigger-A').closest('[class*="sidebar-active"]')).toBeInTheDocument();
    });

    it('applies no active class when no sidebar is open', () => {
      const { container } = renderTriggers();
      const activeWrappers = container.querySelectorAll('[class*="sidebar-active"]');

      expect(activeWrappers).toHaveLength(0);
    });

    it('applies active class to WIDGET_B when WIDGET_B is open', () => {
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_B'));
      renderTriggers();

      const triggerB = screen.getByTestId('trigger-B');
      expect(triggerB.closest('[class*="sidebar-active"]')).toBeInTheDocument();
    });
  });

  describe('click interactions (Use Case 7: Manual Toggle)', () => {
    it('opens the widget whose trigger is clicked', async () => {
      const user = userEvent.setup();
      renderTriggers();
      expect(currentSidebar()).toBe('null');

      await user.click(screen.getByTestId('trigger-A'));

      expect(currentSidebar()).toBe('WIDGET_A');
    });

    it('switches to the widget whose trigger is clicked', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_A'));
      renderTriggers();

      await user.click(screen.getByTestId('trigger-B'));

      expect(currentSidebar()).toBe('WIDGET_B');
    });

    it('closes the open widget when its own trigger is clicked (toggle-to-close)', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_A'));
      renderTriggers();
      expect(currentSidebar()).toBe('WIDGET_A');

      await user.click(screen.getByTestId('trigger-A'));

      expect(currentSidebar()).toBe('null');
    });
  });
});

describe('SidebarTriggers - external widget integration', () => {
  beforeAll(async () => {
    await initializeTestStore({ excludeFetchCourse: true, excludeFetchSequence: true });
  });

  afterEach(() => {
    mergeConfig({ SIDEBAR_WIDGETS: [] });
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('registers an external widget and renders its trigger on screen', () => {
    const ExternalTrigger = () => (
      <button type="button" data-testid="trigger-DUMMY_WIDGET">Dummy Widget</button>
    );
    mergeConfig({
      SIDEBAR_WIDGETS: [{
        id: 'DUMMY_WIDGET',
        priority: 30,
        Sidebar: () => <div>Dummy Sidebar</div>,
        Trigger: ExternalTrigger,
        isAvailable: () => true,
        enabled: true,
      }],
    });

    renderTriggers(getEnabledWidgets());

    expect(screen.getByTestId('trigger-DUMMY_WIDGET')).toBeInTheDocument();
    expect(screen.getByText('Dummy Widget')).toBeVisible();
  });

  it('does not render a trigger for an external widget with enabled: false', () => {
    mergeConfig({
      SIDEBAR_WIDGETS: [{
        id: 'HIDDEN_WIDGET',
        priority: 30,
        Sidebar: () => null,
        Trigger: () => <button type="button" data-testid="trigger-HIDDEN_WIDGET">Hidden</button>,
        enabled: false,
      }],
    });

    renderTriggers(getEnabledWidgets());

    expect(screen.queryByTestId('trigger-HIDDEN_WIDGET')).not.toBeInTheDocument();
  });

  it('clicking an external widget trigger opens it', async () => {
    const user = userEvent.setup();
    // eslint-disable-next-line react/prop-types
    const ExternalTrigger = ({ onClick }) => (
      <button type="button" data-testid="trigger-DUMMY_WIDGET" onClick={onClick}>Dummy Widget</button>
    );
    mergeConfig({
      SIDEBAR_WIDGETS: [{
        id: 'DUMMY_WIDGET',
        priority: 30,
        Sidebar: () => null,
        Trigger: ExternalTrigger,
        enabled: true,
      }],
    });

    renderTriggers(getEnabledWidgets());
    await user.click(screen.getByTestId('trigger-DUMMY_WIDGET'));

    expect(currentSidebar()).toBe('DUMMY_WIDGET');
  });
});
