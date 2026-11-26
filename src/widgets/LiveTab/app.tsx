import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy } from 'react';

import TabWidgetSuspense from '@src/generic/TabWidgetSuspense';
import { liveTabSlotId, type LiveTabSlotProps } from '@src/slots/LiveTabSlot';

export const liveTabWidgetId = 'org.openedx.frontend.widget.learning.liveTab.v1';

export type LiveTabProps = LiveTabSlotProps;

// Learning's slots load with the site, so the tab loads on first render, in the live page's chunk.
const LiveTabRoot = lazy(() => import(/* webpackChunkName: "learning-live" */ '../../course-home/live-tab/LiveTab'));

export const LiveTab = ({ courseId }: LiveTabProps) => (
  <TabWidgetSuspense>
    <LiveTabRoot courseId={courseId} />
  </TabWidgetSuspense>
);

const app: App = {
  appId: 'org.openedx.frontend.app.learning.liveTab',
  slots: [
    {
      slotId: liveTabSlotId,
      id: liveTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: LiveTab,
    },
  ],
};

export default app;
