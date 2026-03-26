import React from 'react';

/**
 * @typedef {Object} SidebarContextValue
 * @property {string|null} currentSidebar - Currently active sidebar ID
 * @property {string|null} initialSidebar - Initial sidebar based on priority cascade
 * @property {(sidebarId: string) => void} toggleSidebar - Function to toggle sidebar
 * @property {boolean} shouldDisplaySidebarOpen - Whether sidebar should be open (desktop)
 * @property {boolean} shouldDisplayFullScreen - Whether in mobile/fullscreen view
 * @property {string} courseId - Current course ID
 * @property {string} unitId - Current unit ID
 * @property {Object.<string, {ID: string, Sidebar: React.ComponentType,
 *   Trigger: React.ComponentType, isAvailable: Function}>} SIDEBARS
 *   - Registry of available sidebar widgets
 * @property {Array<string>} SIDEBAR_ORDER - Ordered list of widget IDs by priority
 */

/**
 * Sidebar Context
 * @type {React.Context<SidebarContextValue>}
 */
const SidebarContext = React.createContext({
  currentSidebar: null,
  initialSidebar: null,
  toggleSidebar: () => {},
  shouldDisplaySidebarOpen: false,
  shouldDisplayFullScreen: false,
  courseId: '',
  unitId: '',
  SIDEBARS: {},
  SIDEBAR_ORDER: [],
  availableSidebarIds: [],
});

export default SidebarContext;
