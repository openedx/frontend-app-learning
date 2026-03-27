import { getConfig } from '@edx/frontend-platform';
import * as discussions from './sidebars/discussions';
import { WIDGET_PRIORITIES, WIDGET_CONFIG } from './constants';

/**
 * Check if discussions widget is available for the current unit
 * @param {Object} context - Contains courseId, unitId, topic, courseHomeMeta
 * @returns {boolean} Whether discussions are available
 */
export const discussionsIsAvailable = ({ topic }) => !!(topic?.id && topic?.enabledInContext);

/**
 * Default built-in widgets for the RIGHT sidebar.
 * The upgrade widget is no longer built-in — configure it via SIDEBAR_WIDGETS
 * in env.config.jsx using the @edx/learning-upgrade-widget package.
 */
export const DEFAULT_WIDGETS = [
  {
    id: discussions.ID,
    priority: WIDGET_PRIORITIES.DISCUSSIONS,
    Sidebar: discussions.Sidebar,
    Trigger: discussions.Trigger,
    isAvailable: discussionsIsAvailable,
    enabled: true,
  },
];

/**
 * Get all enabled widgets (built-in + configured external widgets)
 * @returns {Array} Array of widget configurations
 */
export function getEnabledWidgets() {
  const widgets = [...DEFAULT_WIDGETS].filter(widget => widget.enabled);

  // Add external widgets from config if any; respect their enabled flag same as built-ins
  const externalWidgets = (getConfig()[WIDGET_CONFIG.EXTERNAL_WIDGETS_KEY] || []).filter(w => w.enabled !== false);
  widgets.push(...externalWidgets);

  // Sort by priority (lower number = higher priority)
  return widgets.sort(
    (a, b) => (a.priority || WIDGET_PRIORITIES.DEFAULT_EXTERNAL)
      - (b.priority || WIDGET_PRIORITIES.DEFAULT_EXTERNAL),
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
