export {
  SidebarProvider,
  useSidebar,
  buildSidebarsRegistry,
  getSidebarOrder,
} from './SidebarContext';
export { default as Sidebar } from './Sidebar';
export { default as SidebarTriggers } from './SidebarTriggers';
export { getEnabledWidgets, DEFAULT_WIDGETS } from './defaultWidgets';
export { discussionsIsAvailable } from '@src/widgets/discussions/widgetConfig';
export * from './utils/storage';
export * from './constants';
export { default as SidebarBase } from './common/SidebarBase';
export { default as SidebarTriggerBase } from './common/TriggerBase';
