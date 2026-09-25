import { getConfig } from '@edx/frontend-platform';
import { getEnabledWidgets, DEFAULT_WIDGETS } from './defaultWidgets';
import { WIDGET_PRIORITIES } from './constants';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({})),
}));

jest.mock('@src/widgets/discussions/widgetConfig', () => ({
  discussionsWidgetConfig: {
    id: 'DISCUSSIONS',
    priority: 10,
    Sidebar: () => null,
    Trigger: () => null,
    isAvailable: jest.fn(),
    enabled: true,
  },
}));

describe('defaultWidgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({});
  });

  describe('DEFAULT_WIDGETS', () => {
    it('includes the discussions widget by default', () => {
      expect(DEFAULT_WIDGETS.some(w => w.id === 'DISCUSSIONS')).toBe(true);
    });
  });

  describe('getEnabledWidgets', () => {
    it('returns built-in enabled widgets', () => {
      const widgets = getEnabledWidgets();
      expect(widgets.length).toBeGreaterThan(0);
      expect(widgets.every(w => w.enabled !== false)).toBe(true);
    });

    it('does not include disabled built-in widgets', () => {
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{ id: 'DISABLED_WIDGET', priority: 5, enabled: false }],
      });
      const widgets = getEnabledWidgets();
      expect(widgets.some(w => w.id === 'DISABLED_WIDGET')).toBe(false);
    });

    it('includes external widgets from config with enabled: true', () => {
      const ExternalSidebar = () => null;
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{
          id: 'EXTERNAL',
          priority: 30,
          Sidebar: ExternalSidebar,
          Trigger: () => null,
          enabled: true,
        }],
      });
      const widgets = getEnabledWidgets();
      expect(widgets.some(w => w.id === 'EXTERNAL')).toBe(true);
    });

    it('includes external widgets with no enabled flag (defaults to enabled)', () => {
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{ id: 'EXTERNAL_NO_FLAG', priority: 30 }],
      });
      const widgets = getEnabledWidgets();
      expect(widgets.some(w => w.id === 'EXTERNAL_NO_FLAG')).toBe(true);
    });

    it('excludes external widgets with enabled: false', () => {
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{ id: 'DISABLED', priority: 5, enabled: false }],
      });
      const widgets = getEnabledWidgets();
      expect(widgets.some(w => w.id === 'DISABLED')).toBe(false);
    });

    it('sorts widgets by priority in ascending order (lower = higher priority)', () => {
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{ id: 'LOW_PRIO', priority: 100 }],
      });
      const widgets = getEnabledWidgets();
      for (let i = 1; i < widgets.length; i++) {
        const prevPriority = widgets[i - 1].priority || WIDGET_PRIORITIES.DEFAULT;
        const currPriority = widgets[i].priority || WIDGET_PRIORITIES.DEFAULT;
        expect(prevPriority).toBeLessThanOrEqual(currPriority);
      }
    });

    it('uses WIDGET_PRIORITIES.DEFAULT for widgets without a priority', () => {
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{ id: 'NO_PRIO' }],
      });
      const widgets = getEnabledWidgets();
      const noPrioWidget = widgets.find(w => w.id === 'NO_PRIO');
      expect(noPrioWidget).toBeDefined();
      // It should sort after DISCUSSIONS (priority 10) because default is 50
      const discussionsIndex = widgets.findIndex(w => w.id === 'DISCUSSIONS');
      const noPrioIndex = widgets.findIndex(w => w.id === 'NO_PRIO');
      expect(discussionsIndex).toBeLessThan(noPrioIndex);
    });

    it('handles empty SIDEBAR_WIDGETS config gracefully', () => {
      getConfig.mockReturnValue({ SIDEBAR_WIDGETS: [] });
      expect(() => getEnabledWidgets()).not.toThrow();
    });

    it('handles missing SIDEBAR_WIDGETS config key gracefully', () => {
      getConfig.mockReturnValue({});
      expect(() => getEnabledWidgets()).not.toThrow();
    });

    it('gives priority to platform default widgets over external widgets with the same id', () => {
      // Simulate a platform default and an external widget with the same id
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{
          id: 'DISCUSSIONS',
          priority: 99,
          Sidebar: () => 'External',
          Trigger: () => null,
          enabled: true,
        }],
      });
      const widgets = getEnabledWidgets();
      // Only the platform default should be present
      expect(widgets.filter(w => w.id === 'DISCUSSIONS')).toHaveLength(1);
      // It should be the platform default, not the external one
      expect(widgets.find(w => w.id === 'DISCUSSIONS').priority).toBe(10);
    });

    it('removes a platform default if an external widget with the same id sets enabled: false', () => {
      getConfig.mockReturnValue({
        SIDEBAR_WIDGETS: [{
          id: 'DISCUSSIONS',
          enabled: false,
        }],
      });
      const widgets = getEnabledWidgets();
      // The default should be removed
      expect(widgets.some(w => w.id === 'DISCUSSIONS')).toBe(false);
    });
  });
});
