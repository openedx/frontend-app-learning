import { IntlProvider, Slot, WidgetOperationTypes } from '@openedx/frontend-base';
import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { auxiliarySidebarSlotId } from '@src/slots/AuxiliarySidebarSlot';
import { addSidebarWidgets } from '@src/tests/auxiliarySidebar';
import { addSlotOperations, addTestApp } from '@src/tests/slots';
import { discussionsSidebarWidgetId } from '@src/widgets/DiscussionsSidebar';
import { useAuxiliarySidebarWidgets } from './auxiliarySidebarWidgets';
import { SidebarProvider, useSidebar } from './SidebarContext';

jest.mock('@src/course-home/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-home/data/apiHooks'),
  useCourseHomeMeta: jest.fn(() => ({ data: { tabs: [] } })),
}));

jest.mock('@src/courseware/data/apiHooks', () => ({
  ...jest.requireActual('@src/courseware/data/apiHooks'),
  useCoursewareMetadata: jest.fn(() => ({ data: {} })),
  useDiscussionTopic: jest.fn(() => ({ data: undefined })),
  useMinimalCourseOutline: jest.fn(() => ({ data: undefined })),
}));

jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');
  return {
    ...actual,
    useWindowSize: jest.fn(() => ({ width: actual.breakpoints.extraLarge.minWidth + 1 })),
  };
});

jest.mock('./utils/storage', () => ({
  setSidebarId: jest.fn(),
  getSidebarId: jest.fn(() => null),
  isSidebarClosedByUser: jest.fn(() => false),
  setSidebarClosedByUser: jest.fn(),
}));

const courseId = 'course-test-123';
const unitId = 'unit-test-456';

// A sidebar widget as a plugin registers it: a panel in the auxiliary sidebar slot, and its options.
const stubWidget = (id, overrides = {}) => ({
  id,
  isAvailable: () => true,
  ...overrides,
});

const defaultWidgets = [stubWidget('DISCUSSIONS'), stubWidget('NOTES')];

const ContextConsumer = () => {
  const { currentSidebar, toggleSidebar, availableSidebarIds } = useSidebar();
  return (
    <div>
      <span data-testid="current-sidebar">{currentSidebar ?? 'null'}</span>
      <span data-testid="available-ids">{availableSidebarIds.join(',')}</span>
      <button
        type="button"
        data-testid="toggle-discussions"
        onClick={() => toggleSidebar('DISCUSSIONS')}
      >
        Toggle Discussions
      </button>
      <button
        type="button"
        data-testid="toggle-notes"
        onClick={() => toggleSidebar('NOTES')}
      >
        Toggle Notes
      </button>
    </div>
  );
};

const AvailableIds = () => <span data-testid="available-ids">{useSidebar().availableSidebarIds.join(',')}</span>;

const renderWithoutWidgets = (ui) => render(
  <IntlProvider locale="en" messages={{}}>
    <MemoryRouter>{ui}</MemoryRouter>
  </IntlProvider>,
);

function renderProvider({ widgets = defaultWidgets } = {}) {
  addSidebarWidgets(widgets);
  return renderWithoutWidgets(
    <SidebarProvider courseId={courseId} unitId={unitId}>
      <ContextConsumer />
    </SidebarProvider>,
  );
}

describe('SidebarProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.requireMock('@openedx/paragon').useWindowSize.mockReturnValue({ width: 600 });

    const storage = jest.requireMock('./utils/storage');
    storage.getSidebarId.mockReturnValue(null);
    storage.isSidebarClosedByUser.mockReturnValue(false);
  });

  describe('context values provided', () => {
    it('provides courseId and unitId in context', () => {
      renderProvider();

      expect(screen.getByTestId('current-sidebar')).toBeInTheDocument();
    });

    it('provides the list of available sidebar IDs', () => {
      renderProvider();

      expect(screen.getByTestId('available-ids').textContent).toBe('DISCUSSIONS,NOTES');
    });

    it('excludes a widget from availableSidebarIds when isAvailable returns false', () => {
      renderProvider({
        widgets: [
          stubWidget('DISCUSSIONS'),
          stubWidget('UNAVAILABLE_WIDGET', { isAvailable: () => false }),
        ],
      });

      const availableIds = screen.getByTestId('available-ids').textContent;
      expect(availableIds).toContain('DISCUSSIONS');
      expect(availableIds).not.toContain('UNAVAILABLE_WIDGET');
    });

    it('treats a widget without isAvailable as always available', () => {
      renderProvider({ widgets: [stubWidget('ALWAYS_ON', { isAvailable: undefined })] });

      expect(screen.getByTestId('available-ids').textContent).toBe('ALWAYS_ON');
    });
  });

  describe('when a metadata query has no data', () => {
    const widgets = [
      stubWidget('ALWAYS_ON', { isAvailable: undefined }),
      stubWidget('COURSE_LIST', { isAvailable: (context) => context.courseId === courseId }),
      // The upgrade widget's rule, which reads a course-home field.
      stubWidget('UPGRADE', { isAvailable: ({ course }) => !!course?.verifiedMode }),
    ];

    afterEach(() => {
      jest.requireMock('@src/course-home/data/apiHooks').useCourseHomeMeta.mockReturnValue({ data: { tabs: [] } });
      jest.requireMock('@src/courseware/data/apiHooks').useCoursewareMetadata.mockReturnValue({ data: {} });
    });

    it('still asks every widget when the course-home metadata has no data', () => {
      jest.requireMock('@src/course-home/data/apiHooks').useCourseHomeMeta.mockReturnValue({ data: undefined });
      renderProvider({ widgets });

      expect(screen.getByTestId('available-ids').textContent).toBe('ALWAYS_ON,COURSE_LIST');
    });

    it('still asks every widget when the courseware metadata has no data', () => {
      jest.requireMock('@src/course-home/data/apiHooks').useCourseHomeMeta.mockReturnValue(
        { data: { tabs: [], verifiedMode: { price: 10 } } },
      );
      jest.requireMock('@src/courseware/data/apiHooks').useCoursewareMetadata.mockReturnValue({ data: undefined });
      renderProvider({ widgets });

      expect(screen.getByTestId('available-ids').textContent).toBe('ALWAYS_ON,COURSE_LIST,UPGRADE');
    });
  });

  describe('Use Case 7: Manual toggle interactions', () => {
    it('UC7a: opens a sidebar panel when none is open', () => {
      jest.requireMock('@openedx/paragon').useWindowSize.mockReturnValue({ width: 1400 });
      renderProvider();

      expect(screen.getByTestId('current-sidebar').textContent).not.toBe('null');
    });

    it('UC7b: closes the currently open panel when the same trigger is clicked', async () => {
      renderProvider();

      // Mobile starts with no panel open
      expect(screen.getByTestId('current-sidebar').textContent).toBe('null');

      // Open DISCUSSIONS
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-discussions'));
      });
      expect(screen.getByTestId('current-sidebar').textContent).toBe('DISCUSSIONS');

      // Click same panel again: close
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-discussions'));
      });
      expect(screen.getByTestId('current-sidebar').textContent).toBe('null');
    });

    it('UC7c: switches to a different panel when a different trigger is clicked', async () => {
      renderProvider();

      // Mobile starts with no panel open, open DISCUSSIONS first
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-discussions'));
      });
      expect(screen.getByTestId('current-sidebar').textContent).toBe('DISCUSSIONS');

      // Click NOTES → switches
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-notes'));
      });
      expect(screen.getByTestId('current-sidebar').textContent).toBe('NOTES');
    });

    it('UC7d: persists the new sidebar ID to localStorage on toggle', async () => {
      const { setSidebarId, setSidebarClosedByUser } = jest.requireMock('./utils/storage');
      renderProvider();

      // Mobile starts closed, toggle to NOTES
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-notes'));
      });
      expect(setSidebarId).toHaveBeenCalledWith(courseId, 'NOTES');
      expect(setSidebarClosedByUser).toHaveBeenLastCalledWith(false);
    });

    it('UC7e: persists null to localStorage and marks the sidebar closed when closing the open panel', async () => {
      const { setSidebarId, setSidebarClosedByUser } = jest.requireMock('./utils/storage');
      renderProvider();

      // Open DISCUSSIONS first
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-discussions'));
      });
      // Close it
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-discussions'));
      });
      expect(setSidebarId).toHaveBeenLastCalledWith(courseId, null);
      expect(setSidebarClosedByUser).toHaveBeenLastCalledWith(true);
    });
  });

  describe('renderWithWidgetProviders', () => {
    it('renders children even when no widgets have a Provider', () => {
      renderProvider();

      expect(screen.getByTestId('current-sidebar')).toBeInTheDocument();
    });

    it('wraps children with widget Providers when widgets define one', () => {
      const ProviderCallCheck = jest.fn(({ children }) => children);
      renderProvider({ widgets: [stubWidget('DISCUSSIONS', { Provider: ProviderCallCheck })] });

      expect(ProviderCallCheck).toHaveBeenCalled();
    });
  });
});

describe('useSidebar', () => {
  it('throws outside a SidebarProvider', () => {
    // Caught in the component, so React has no uncaught render error to report.
    const Probe = () => {
      try {
        useSidebar();
      } catch (error) {
        return error.message;
      }
      return null;
    };
    render(<Probe />);

    expect(screen.getByText('useSidebar must be used within a SidebarProvider')).toBeInTheDocument();
  });
});

describe('the sidebar widget list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.requireMock('@openedx/paragon').useWindowSize.mockReturnValue({ width: 600 });
  });

  // Every widget, available or not, in the order the provider holds them.
  const WidgetList = () => (
    <span data-testid="widgets">{useAuxiliarySidebarWidgets().map(({ id }) => id).join(',')}</span>
  );
  const widgetList = () => screen.getByTestId('widgets').textContent;
  const availableIds = () => screen.getByTestId('available-ids').textContent;

  // The list with the widgets that are available on the unit.
  const renderInProvider = () => renderWithoutWidgets(
    <SidebarProvider courseId={courseId} unitId={unitId}>
      <WidgetList />
      <AvailableIds />
    </SidebarProvider>,
  );

  // Options a site, or another app, sets on a widget's panel.
  const setOptions = (relatedId, options) => addSlotOperations([{
    slotId: auxiliarySidebarSlotId, relatedId, op: WidgetOperationTypes.OPTIONS, options,
  }]);

  // Learning registers its own discussions widget, so it is in every list. It is not available here: the unit has
  // no discussion topic.
  const learningWidgets = discussionsSidebarWidgetId;

  it('holds the panels in the order of the slot', () => {
    addSidebarWidgets([stubWidget('NOTES'), stubWidget('GLOSSARY')]);
    renderWithoutWidgets(<WidgetList />);

    expect(widgetList()).toBe(`${learningWidgets},NOTES,GLOSSARY`);
  });

  it('follows the slot operations a site reorders the panels with', () => {
    addSidebarWidgets([stubWidget('NOTES')]);
    addSlotOperations([{
      slotId: auxiliarySidebarSlotId,
      id: 'GLOSSARY',
      op: WidgetOperationTypes.INSERT_BEFORE,
      relatedId: discussionsSidebarWidgetId,
      element: <div />,
    }]);
    renderInProvider();

    expect(widgetList()).toBe(`GLOSSARY,${learningWidgets},NOTES`);
    expect(availableIds()).toBe('GLOSSARY,NOTES');
  });

  it('treats a panel with no options as always available', () => {
    addSidebarWidgets([{ id: 'NO_OPTIONS', noOptions: true }]);
    renderInProvider();

    expect(widgetList()).toBe(`${learningWidgets},NO_OPTIONS`);
    expect(availableIds()).toBe('NO_OPTIONS');
  });

  it('ignores options set on a widget with no panel', () => {
    setOptions('NO_PANEL', { isAvailable: () => true });
    renderWithoutWidgets(<WidgetList />);

    expect(widgetList()).toBe(learningWidgets);
  });

  it('drops a widget whose panel a site removes, with its provider', () => {
    const Provider = jest.fn(({ children }) => children);
    addSidebarWidgets([stubWidget('NOTES', { Provider })]);
    addSlotOperations([
      { slotId: auxiliarySidebarSlotId, op: WidgetOperationTypes.REMOVE, relatedId: 'NOTES' },
      { slotId: auxiliarySidebarSlotId, op: WidgetOperationTypes.REMOVE, relatedId: discussionsSidebarWidgetId },
    ]);
    renderWithoutWidgets(
      <SidebarProvider courseId={courseId} unitId={unitId}><WidgetList /></SidebarProvider>,
    );

    expect(widgetList()).toBe('');
    expect(Provider).not.toHaveBeenCalled();
  });

  it('leaves out an option of the wrong kind, so its default applies', () => {
    addSidebarWidgets([{ id: 'NOTES', noOptions: true }]);
    setOptions('NOTES', { isAvailable: false, Provider: 'div' });
    const { container } = renderInProvider();

    // Had `isAvailable` counted, the widget would not be available; had `Provider`, a <div> would wrap the page.
    expect(availableIds()).toBe('NOTES');
    expect(screen.getByTestId('widgets').parentElement).toBe(container);
  });

  it('merges the options several operations set on one widget, the later one winning', () => {
    const Provider = jest.fn(({ children }) => children);
    addSidebarWidgets([stubWidget('NOTES', { isAvailable: () => false, Provider })]);
    setOptions('NOTES', { isAvailable: () => true });
    renderInProvider();

    // The later operation changes the one option it names: the provider is still the first app's.
    expect(availableIds()).toBe('NOTES');
    expect(Provider).toHaveBeenCalled();
  });

  it('applies options set under an alias of the widget ID', () => {
    addSlotOperations([{
      slotId: auxiliarySidebarSlotId,
      id: 'NOTES',
      idAliases: ['OLD_NOTES'],
      op: WidgetOperationTypes.APPEND,
      element: <div />,
    }]);
    setOptions('OLD_NOTES', { isAvailable: () => false });
    renderInProvider();

    expect(widgetList()).toBe(`${learningWidgets},NOTES`);
    expect(availableIds()).toBe('');
  });

  it('hands on the same list until a widget or an option changes', () => {
    const lists = [];
    const Probe = () => {
      lists.push(useAuxiliarySidebarWidgets());
      return null;
    };
    addSidebarWidgets([stubWidget('NOTES')]);
    const { rerender } = renderWithoutWidgets(<Probe />);
    rerender(<IntlProvider locale="en" messages={{}}><MemoryRouter><Probe /></MemoryRouter></IntlProvider>);

    expect(lists.length).toBeGreaterThan(1);
    expect(new Set(lists).size).toBe(1);
  });

  it("takes no default content from the slot the provider is rendered in, which is not the panel slot", () => {
    addSidebarWidgets([stubWidget('NOTES')]);
    renderWithoutWidgets(
      <Slot id="org.example.slot.enclosing" layout={WidgetList}>
        <span>The enclosing slot&apos;s default content</span>
      </Slot>,
    );

    expect(widgetList()).toBe(`${learningWidgets},NOTES`);
  });
});
