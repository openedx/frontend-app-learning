export { default as SidebarProvider } from './SidebarContextProvider';
export { default as Sidebar } from './Sidebar';
export { default as SidebarTriggers } from './SidebarTriggers';
export { default as SidebarContext } from './SidebarContext';
export {
  getEnabledWidgets,
  buildSidebarsRegistry,
  getSidebarOrder,
  DEFAULT_WIDGETS,
} from './defaultWidgets';
export { discussionsIsAvailable } from '@src/widgets/discussions/widgetConfig';
export * from './utils/storage';
export * from './constants';
export { default as SidebarBase } from './common/SidebarBase';
export { default as SidebarTriggerBase } from './common/TriggerBase';
