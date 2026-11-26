import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy } from 'react';

import TabWidgetSuspense from '@src/generic/TabWidgetSuspense';
import { outlineTabSlotId, type OutlineTabSlotProps } from '@src/slots/OutlineTabSlot';

export const outlineTabWidgetId = 'org.openedx.frontend.widget.learning.outlineTab.v1';

export type OutlineTabProps = OutlineTabSlotProps;

// Learning's slots load with the site, so the tab loads on first render, in the outline page's chunk.
const OutlineTabRoot = lazy(() => import(/* webpackChunkName: "learning-outline" */ '../../course-home/outline-tab'));

export const OutlineTab = ({ courseId }: OutlineTabProps) => (
  <TabWidgetSuspense>
    <OutlineTabRoot courseId={courseId} />
  </TabWidgetSuspense>
);

const app: App = {
  appId: 'org.openedx.frontend.app.learning.outlineTab',
  slots: [
    {
      slotId: outlineTabSlotId,
      id: outlineTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: OutlineTab,
    },
  ],
};

export default app;
