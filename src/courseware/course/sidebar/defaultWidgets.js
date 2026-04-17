import { getConfig } from '@edx/frontend-platform';
import { discussionsWidgetConfig } from '@src/widgets/discussions/widgetConfig';
import { upgradeWidgetConfig } from '@src/widgets/upgrade/src/widgetConfig';
import { WIDGET_PRIORITIES, WIDGET_CONFIG } from './constants';

/**
 * Default built-in widgets for the RIGHT sidebar.
 */
export const DEFAULT_WIDGETS = [
  discussionsWidgetConfig,
  upgradeWidgetConfig,
];

/**
 * Get all enabled widgets (built-in + configured external widgets)
 * @returns {Array} Array of widget configurations
 */
export function getEnabledWidgets() {
  const externalWidgets = getConfig()[WIDGET_CONFIG.EXTERNAL_WIDGETS_KEY] || [];
  const disabledIds = new Set(
    externalWidgets.filter(w => w.enabled === false).map(w => w.id),
  );
  const defaultIds = new Set(DEFAULT_WIDGETS.map(w => w.id));

  const widgets = [...DEFAULT_WIDGETS].filter(
    widget => widget.enabled && !disabledIds.has(widget.id),
  );

  widgets.push(
    ...externalWidgets.filter(
      w => w.enabled !== false && !defaultIds.has(w.id),
    ),
  );

  return widgets.sort(
    (a, b) => (a.priority || WIDGET_PRIORITIES.DEFAULT)
      - (b.priority || WIDGET_PRIORITIES.DEFAULT),
  );
}

/**
 * Build SIDEBARS registry from widgets
 * @param {Array} widgets - Array of widget configurations
 * @returns {Object} SIDEBARS registry object
 */
export function buildSidebarsRegistry(widgets) {
  const registry = {};
  widgets.forEach(widget => {
    registry[widget.id] = {
      ID: widget.id,
      Sidebar: widget.Sidebar,
      Trigger: widget.Trigger,
      isAvailable: widget.isAvailable,
    };
  });
  return registry;
}

/**
 * Get ordered list of widget IDs
 * @param {Array} widgets - Array of widget configurations
 * @returns {Array} Array of widget IDs in priority order
 */
export function getSidebarOrder(widgets) {
  return widgets.map(widget => widget.id);
}
