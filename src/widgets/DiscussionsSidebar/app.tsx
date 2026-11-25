import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy, Suspense } from 'react';

import type { AuxiliarySidebarWidgetOptions } from '@src/courseware/course/sidebar/auxiliarySidebarWidgets';
import { auxiliarySidebarSlotId } from '@src/slots/AuxiliarySidebarSlot';
import { auxiliarySidebarTriggerSlotId } from '@src/slots/AuxiliarySidebarTriggerSlot';

import { discussionsSidebarWidgetId } from './constants';
import DiscussionsProvider from './DiscussionsProvider';
import type { DiscussionsWidgetProps } from './types';
import { getDiscussionsSidebarUrl } from './urls';

// Learning inserts these by default, so the app loads this module: the trigger and the panel load on first render,
// in a chunk of their own, rather than with the app.
const DiscussionsTrigger = lazy(() => import(/* webpackChunkName: "learning-discussions-sidebar" */ './DiscussionsTrigger'));
const DiscussionsSidebar = lazy(() => import(/* webpackChunkName: "learning-discussions-sidebar" */ './DiscussionsSidebar'));

export const LazyDiscussionsTrigger = (props: DiscussionsWidgetProps) => (
  <Suspense fallback={null}>
    <DiscussionsTrigger {...props} />
  </Suspense>
);

export const LazyDiscussionsSidebar = (props: DiscussionsWidgetProps) => (
  <Suspense fallback={null}>
    <DiscussionsSidebar {...props} />
  </Suspense>
);

// Available on a unit whose discussion topic is enabled in context, when something provides the discussions sidebar
// role.
export const discussionsSidebarIsAvailable: NonNullable<AuxiliarySidebarWidgetOptions['isAvailable']> = (
  { courseId, unitId, unit },
) => !!(getDiscussionsSidebarUrl(courseId, unitId) && unit?.id && unit?.enabledInContext);

export const discussionsSidebarOptions: AuxiliarySidebarWidgetOptions = {
  isAvailable: discussionsSidebarIsAvailable,
  Provider: DiscussionsProvider,
};

const app: App = {
  appId: 'org.openedx.frontend.app.learning.discussionsSidebar',
  slots: [
    {
      slotId: auxiliarySidebarTriggerSlotId,
      id: discussionsSidebarWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: LazyDiscussionsTrigger,
    },
    {
      slotId: auxiliarySidebarSlotId,
      id: discussionsSidebarWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: LazyDiscussionsSidebar,
    },
    {
      slotId: auxiliarySidebarSlotId,
      relatedId: discussionsSidebarWidgetId,
      op: WidgetOperationTypes.OPTIONS,
      options: { ...discussionsSidebarOptions },
    },
  ],
};

export default app;
