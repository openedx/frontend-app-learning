/**
 * This is the sole contract between the host MFE and external widget packages.
 *
 * Usage in a widget:
 *   import {
 *     SidebarContext, SidebarBase, SidebarTriggerBase,
 *     useModel, getLocalStorage, setLocalStorage,
 *   } from '@edx/learning-mfe-widget';
 */
export { default as SidebarContext } from './courseware/course/sidebar/SidebarContext';
export { default as SidebarBase } from './courseware/course/sidebar/common/SidebarBase';
export { default as SidebarTriggerBase } from './courseware/course/sidebar/common/TriggerBase';
export { useModel } from './generic/model-store';
export { getLocalStorage, setLocalStorage } from './data/localStorage';
