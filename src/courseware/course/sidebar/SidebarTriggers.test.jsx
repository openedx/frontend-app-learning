import { WidgetOperationTypes } from '@openedx/frontend-base';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import AuxiliarySidebarTriggerSlot, { auxiliarySidebarTriggerSlotId } from '@src/slots/AuxiliarySidebarTriggerSlot';
import { auxiliarySidebarSlotId } from '@src/slots/AuxiliarySidebarSlot';
import { addSidebarWidgets } from '@src/tests/auxiliarySidebar';
import { render } from '@src/tests/render';
import SidebarState from '@src/tests/SidebarState';
import { addSlotOperations, addTestApp } from '@src/tests/slots';
import SidebarTriggerBase from './common/TriggerBase';
import { SidebarProvider } from './SidebarContext';

const courseId = 'course-v1:edX+Test+2024';
const unitId = 'unit-1';

// A trigger as a widget writes one: it toggles its own panel.
const mockTrigger = (id) => () => (
  <SidebarTriggerBase sidebarId={id} ariaLabel={`Trigger ${id}`}>
    <span>{id}</span>
  </SidebarTriggerBase>
);

const stubWidget = (id, overrides = {}) => ({
  id,
  Trigger: mockTrigger(id),
  isAvailable: () => true,
  ...overrides,
});

const defaultWidgets = [stubWidget('WIDGET_A'), stubWidget('WIDGET_B')];

function renderTriggers(widgets = defaultWidgets) {
  addSidebarWidgets(widgets);
  return render(
    <SidebarProvider courseId={courseId} unitId={unitId}>
      <AuxiliarySidebarTriggerSlot courseId={courseId} sequenceId="sequence-1" unitId={unitId} />
      <SidebarState />
    </SidebarProvider>,
    { wrapWithRouter: true },
  );
}

const trigger = (id) => screen.queryByRole('button', { name: `Trigger ${id}` });
const currentSidebar = () => screen.getByTestId('current-sidebar').textContent;

describe('SidebarTriggers', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  describe('rendering', () => {
    it('renders a trigger for each available widget', () => {
      renderTriggers();

      expect(trigger('WIDGET_A')).toBeInTheDocument();
      expect(trigger('WIDGET_B')).toBeInTheDocument();
    });

    it('renders the triggers in the order of their panels, whatever order the triggers were added in', () => {
      const { APPEND } = WidgetOperationTypes;
      addTestApp({
        slots: [
          {
            slotId: auxiliarySidebarTriggerSlotId, id: 'WIDGET_A', op: APPEND, component: mockTrigger('WIDGET_A'),
          },
          {
            slotId: auxiliarySidebarTriggerSlotId, id: 'WIDGET_B', op: APPEND, component: mockTrigger('WIDGET_B'),
          },
          {
            slotId: auxiliarySidebarSlotId, id: 'WIDGET_B', op: APPEND, element: <div />,
          },
          {
            slotId: auxiliarySidebarSlotId, id: 'WIDGET_A', op: APPEND, element: <div />,
          },
        ],
      });
      renderTriggers([]);

      expect(screen.getAllByRole('button').map(button => button.getAttribute('aria-label')))
        .toEqual(['Trigger WIDGET_B', 'Trigger WIDGET_A']);
    });

    it('renders no trigger for a widget that is not available', () => {
      renderTriggers([
        stubWidget('WIDGET_A'),
        stubWidget('WIDGET_B', { isAvailable: () => false }),
      ]);

      expect(trigger('WIDGET_A')).toBeInTheDocument();
      expect(trigger('WIDGET_B')).not.toBeInTheDocument();
    });

    it('renders nothing when no widgets are registered', () => {
      renderTriggers([]);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('passes each trigger what the slot is about', () => {
      const Trigger = jest.fn(() => null);
      renderTriggers([stubWidget('WIDGET_A', { Trigger })]);

      expect(Trigger.mock.calls[0][0]).toEqual({ courseId, sequenceId: 'sequence-1', unitId });
    });
  });

  describe('active state styling', () => {
    it('applies active class to the currently open sidebar trigger', () => {
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_A'));
      const { container } = renderTriggers();
      const triggerWrappers = container.querySelectorAll('[class*="sidebar-active"]');

      expect(triggerWrappers).toHaveLength(1);
      expect(trigger('WIDGET_A').closest('[class*="sidebar-active"]')).toBeInTheDocument();
    });

    it('applies no active class when no sidebar is open', () => {
      const { container } = renderTriggers();
      const activeWrappers = container.querySelectorAll('[class*="sidebar-active"]');

      expect(activeWrappers).toHaveLength(0);
    });

    it('applies active class to WIDGET_B when WIDGET_B is open', () => {
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_B'));
      renderTriggers();

      expect(trigger('WIDGET_B').closest('[class*="sidebar-active"]')).toBeInTheDocument();
    });
  });

  describe('click interactions (Use Case 7: Manual Toggle)', () => {
    it('opens the widget whose trigger is clicked', async () => {
      const user = userEvent.setup();
      renderTriggers();
      expect(currentSidebar()).toBe('null');

      await user.click(trigger('WIDGET_A'));

      expect(currentSidebar()).toBe('WIDGET_A');
    });

    it('switches to the widget whose trigger is clicked', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_A'));
      renderTriggers();

      await user.click(trigger('WIDGET_B'));

      expect(currentSidebar()).toBe('WIDGET_B');
    });

    it('closes the open widget when its own trigger is clicked (toggle-to-close)', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem(`sidebar.${courseId}`, JSON.stringify('WIDGET_A'));
      renderTriggers();
      expect(currentSidebar()).toBe('WIDGET_A');

      await user.click(trigger('WIDGET_A'));

      expect(currentSidebar()).toBe('null');
    });
  });
});

describe('SidebarTriggers - external widget integration', () => {
  const dummyWidgetId = 'org.example.widget.dummy';

  // A widget as a plugin app registers it in a site config: the two operations alone, with no options.
  const addDummyPlugin = () => addTestApp({
    slots: [
      {
        slotId: auxiliarySidebarTriggerSlotId,
        id: dummyWidgetId,
        op: WidgetOperationTypes.APPEND,
        component: mockTrigger(dummyWidgetId),
      },
      {
        slotId: auxiliarySidebarSlotId,
        id: dummyWidgetId,
        op: WidgetOperationTypes.APPEND,
        element: <div>Dummy Sidebar</div>,
      },
    ],
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('registers an external widget and renders its trigger on screen', () => {
    addDummyPlugin();
    renderTriggers([]);

    expect(trigger(dummyWidgetId)).toBeVisible();
  });

  it('does not render the trigger of a widget whose panel a site removed', () => {
    addDummyPlugin();
    addSlotOperations([{ slotId: auxiliarySidebarSlotId, op: WidgetOperationTypes.REMOVE, relatedId: dummyWidgetId }]);
    renderTriggers([]);

    expect(trigger(dummyWidgetId)).not.toBeInTheDocument();
  });

  it('does not render a trigger that has no panel', () => {
    addSlotOperations([{
      slotId: auxiliarySidebarTriggerSlotId,
      id: dummyWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: mockTrigger(dummyWidgetId),
    }]);
    renderTriggers([]);

    expect(trigger(dummyWidgetId)).not.toBeInTheDocument();
  });

  it('clicking an external widget trigger opens it', async () => {
    const user = userEvent.setup();
    addDummyPlugin();
    renderTriggers([]);

    await user.click(trigger(dummyWidgetId));

    expect(currentSidebar()).toBe(dummyWidgetId);
  });
});
