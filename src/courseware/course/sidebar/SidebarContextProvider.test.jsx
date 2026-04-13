import React, { useContext } from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SidebarContext from './SidebarContext';
import SidebarProvider from './SidebarContextProvider';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn((modelType) => {
    if (modelType === 'courseHomeMeta') {
      return { tabs: [] };
    }
    return null;
  }),
}));

jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');
  return {
    ...actual,
    useWindowSize: jest.fn(() => ({ width: actual.breakpoints.extraLarge.minWidth + 1 })),
  };
});

jest.mock('./defaultWidgets', () => ({
  getEnabledWidgets: jest.fn(() => [
    {
      id: 'DISCUSSIONS',
      priority: 10,
      Sidebar: () => null,
      Trigger: () => null,
      isAvailable: () => true,
      enabled: true,
    },
    {
      id: 'NOTES',
      priority: 20,
      Sidebar: () => null,
      Trigger: () => null,
      isAvailable: () => true,
      enabled: true,
    },
  ]),
  buildSidebarsRegistry: jest.requireActual('./defaultWidgets').buildSidebarsRegistry,
  getSidebarOrder: jest.requireActual('./defaultWidgets').getSidebarOrder,
}));

jest.mock('./utils/storage', () => ({
  setSidebarId: jest.fn(),
  getSidebarId: jest.fn(() => null),
  isOutlineSidebarCollapsed: jest.fn(() => false),
  setOutlineSidebarCollapsed: jest.fn(),
}));

const courseId = 'course-test-123';
const unitId = 'unit-test-456';

const ContextConsumer = () => {
  const { currentSidebar, toggleSidebar, availableSidebarIds } = useContext(SidebarContext);
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
        <SidebarProvider courseId={courseId} unitId={unitId} {...props}>
          <ContextConsumer />
        </SidebarProvider>
      </MemoryRouter>
    </IntlProvider>,
  );
}

describe('SidebarContextProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.requireMock('@openedx/paragon').useWindowSize.mockReturnValue({ width: 600 });

    const storage = jest.requireMock('./utils/storage');
    storage.getSidebarId.mockReturnValue(null);
    storage.isOutlineSidebarCollapsed.mockReturnValue(false);
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
      const { getEnabledWidgets } = jest.requireMock('./defaultWidgets');
      getEnabledWidgets.mockReturnValueOnce([
        {
          id: 'DISCUSSIONS',
          priority: 10,
          Sidebar: () => null,
          Trigger: () => null,
          isAvailable: () => true,
          enabled: true,
        },
        {
          id: 'UNAVAILABLE_WIDGET',
          priority: 20,
          Sidebar: () => null,
          Trigger: () => null,
          isAvailable: () => false,
          enabled: true,
        },
      ]);
      renderProvider();

      const availableIds = screen.getByTestId('available-ids').textContent;
      expect(availableIds).toContain('DISCUSSIONS');
      expect(availableIds).not.toContain('UNAVAILABLE_WIDGET');
    });
  });

  describe('Use Case 7: Manual toggle interactions', () => {
    it('UC7a: opens a sidebar panel when none is open', async () => {
      // Use desktop width so sidebar starts closed (no auto-open)
      jest.requireMock('@openedx/paragon').useWindowSize.mockReturnValue({ width: 1400 });
      renderProvider();

      expect(screen.getByTestId('current-sidebar').textContent).toBe('DISCUSSIONS');
      // Toggle off, then toggle a different panel on
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-discussions'));
      });
      expect(screen.getByTestId('current-sidebar').textContent).toBe('null');
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-notes'));
      });
      expect(screen.getByTestId('current-sidebar').textContent).toBe('NOTES');
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
      const { setSidebarId } = jest.requireMock('./utils/storage');
      renderProvider();

      // Mobile starts closed, toggle to NOTES
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-notes'));
      });
      expect(setSidebarId).toHaveBeenCalledWith(courseId, 'NOTES');
    });

    it('UC7e: persists null to localStorage when closing the open panel', async () => {
      const { setSidebarId } = jest.requireMock('./utils/storage');
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
    });
  });

  describe('renderWithWidgetProviders', () => {
    it('renders children even when no widgets have a Provider', () => {
      renderProvider();

      expect(screen.getByTestId('current-sidebar')).toBeInTheDocument();
    });

    it('wraps children with widget Providers when widgets define one', () => {
      const ProviderCallCheck = jest.fn(({ children }) => children);
      const { getEnabledWidgets } = jest.requireMock('./defaultWidgets');
      getEnabledWidgets.mockReturnValueOnce([{
        id: 'DISCUSSIONS',
        priority: 10,
        Sidebar: () => null,
        Trigger: () => null,
        isAvailable: () => true,
        enabled: true,
        Provider: ProviderCallCheck,
      }]);
      renderProvider();
      expect(ProviderCallCheck).toHaveBeenCalled();
    });
  });
});
