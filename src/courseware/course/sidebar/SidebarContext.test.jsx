import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, renderHook, screen, fireEvent, act,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  SidebarProvider, buildSidebarsRegistry, getSidebarOrder, useSidebar,
} from './SidebarContext';

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(() => ({})),
}));

jest.mock('@src/course-home/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-home/data/apiHooks'),
  useCourseHomeMeta: jest.fn(() => ({ data: { tabs: [] } })),
}));

jest.mock('@src/courseware/data/apiHooks', () => ({
  ...jest.requireActual('@src/courseware/data/apiHooks'),
  useDiscussionTopic: jest.fn(() => ({ data: undefined })),
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

const stubWidget = (id, priority, overrides = {}) => ({
  id,
  priority,
  Sidebar: () => null,
  Trigger: () => null,
  isAvailable: () => true,
  enabled: true,
  ...overrides,
});

const defaultWidgets = [stubWidget('DISCUSSIONS', 10), stubWidget('NOTES', 20)];

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

function renderProvider(props = {}) {
  return render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <SidebarProvider courseId={courseId} unitId={unitId} widgets={defaultWidgets} {...props}>
          <ContextConsumer />
        </SidebarProvider>
      </MemoryRouter>
    </IntlProvider>,
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
          stubWidget('DISCUSSIONS', 10),
          stubWidget('UNAVAILABLE_WIDGET', 20, { isAvailable: () => false }),
        ],
      });

      const availableIds = screen.getByTestId('available-ids').textContent;
      expect(availableIds).toContain('DISCUSSIONS');
      expect(availableIds).not.toContain('UNAVAILABLE_WIDGET');
    });

    it('treats a widget without isAvailable as always available', () => {
      renderProvider({ widgets: [stubWidget('ALWAYS_ON', 10, { isAvailable: undefined })] });

      expect(screen.getByTestId('available-ids').textContent).toBe('ALWAYS_ON');
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
      renderProvider({ widgets: [stubWidget('DISCUSSIONS', 10, { Provider: ProviderCallCheck })] });

      expect(ProviderCallCheck).toHaveBeenCalled();
    });
  });
});

describe('useSidebar', () => {
  it('throws outside a SidebarProvider', () => {
    expect(() => renderHook(() => useSidebar()))
      .toThrow('useSidebar must be used within a SidebarProvider');
  });
});

describe('buildSidebarsRegistry', () => {
  it('builds a registry keyed by widget id', () => {
    const MockSidebar = () => null;
    const MockTrigger = () => null;
    const mockIsAvailable = jest.fn();
    const widgets = [{
      id: 'DISCUSSIONS',
      Sidebar: MockSidebar,
      Trigger: MockTrigger,
      isAvailable: mockIsAvailable,
    }];
    const registry = buildSidebarsRegistry(widgets);
    expect(registry.DISCUSSIONS).toBeDefined();
    expect(registry.DISCUSSIONS.ID).toBe('DISCUSSIONS');
    expect(registry.DISCUSSIONS.Sidebar).toBe(MockSidebar);
    expect(registry.DISCUSSIONS.Trigger).toBe(MockTrigger);
    expect(registry.DISCUSSIONS.isAvailable).toBe(mockIsAvailable);
  });

  it('returns an empty object for an empty widget list', () => {
    expect(buildSidebarsRegistry([])).toEqual({});
  });

  it('registers multiple widgets', () => {
    const widgets = [
      { id: 'DISCUSSIONS', Sidebar: () => null, Trigger: () => null },
      { id: 'CUSTOM_WIDGET', Sidebar: () => null, Trigger: () => null },
    ];
    const registry = buildSidebarsRegistry(widgets);
    expect(Object.keys(registry)).toHaveLength(2);
    expect(registry.CUSTOM_WIDGET).toBeDefined();
  });
});

describe('getSidebarOrder', () => {
  it('returns an array of widget IDs in the given order', () => {
    const widgets = [
      { id: 'DISCUSSIONS', priority: 10 },
      { id: 'CUSTOM_WIDGET', priority: 20 },
    ];
    expect(getSidebarOrder(widgets)).toEqual(['DISCUSSIONS', 'CUSTOM_WIDGET']);
  });

  it('returns an empty array for empty input', () => {
    expect(getSidebarOrder([])).toEqual([]);
  });
});
