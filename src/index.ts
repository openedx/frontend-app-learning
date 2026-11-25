// Learning's public surface. Everything exported here is part of the app's contract (frontend-base ADR 0018,
// section 6): removing or changing a name is a breaking change. A name belongs here only when a README under
// src/slots, src/widgets or src/courseware/course/sidebar uses it, or a known plugin does. `index.test.ts` keeps
// every README import honest.

// The app, and its routes for sites that compose their own.
export { default as learningApp } from './app';
export { default as learningRoutes } from './routes';

// Slots: every slot's ID and the props its widgets receive.
export * from './slots/index';

// Widgets Learning ships but does not insert: one operation each, to enable them from site config.
export { courseBreadcrumbsSlotOperation, courseBreadcrumbsWidgetId } from './widgets/CourseBreadcrumbs';
export { sequenceNavigationSlotOperation } from './widgets/SequenceNavigation';

// The tabs, as widgets: Learning inserts each into its tab's slot, and another app can render one in its own.
export { OutlineTab, type OutlineTabProps, outlineTabWidgetId } from './widgets/OutlineTab';
export { DatesTab, type DatesTabProps, datesTabWidgetId } from './widgets/DatesTab';
export { ProgressTab, type ProgressTabProps, progressTabWidgetId } from './widgets/ProgressTab';
export { LiveTab, type LiveTabProps, liveTabWidgetId } from './widgets/LiveTab';
export { CoursewareTab, type CoursewareTabProps, coursewareTabWidgetId } from './widgets/CoursewareTab';

// The auxiliary sidebar: the options a sidebar widget can set on its panel, the building blocks for its trigger and
// panel, and Learning's own discussions widget.
export {
  type AuxiliarySidebarWidgetOptions,
  type SidebarAvailabilityContext,
} from './courseware/course/sidebar/auxiliarySidebarWidgets';
export { useSidebar } from './courseware/course/sidebar/useSidebar';
export { default as SidebarBase } from './courseware/course/sidebar/common/SidebarBase';
export { default as SidebarTriggerBase } from './courseware/course/sidebar/common/TriggerBase';
export { discussionsSidebarWidgetId } from './widgets/DiscussionsSidebar/constants';

// Default content a replacement widget can compose instead of reimplementing.
export { default as ContentIFrame } from './courseware/course/sequence/Unit/ContentIFrame';
export { getIFrameUrl } from './courseware/course/sequence/Unit/urls';
export { default as UnitNavigation } from './courseware/course/sequence/sequence-navigation/UnitNavigation';
export { CompletionIcon } from './courseware/course/sidebar/sidebars/course-outline/components/CompletionIcon';

// Data a widget cannot get from its slot's props.
export { useExamsData } from './course-home/progress-tab/hooks';
