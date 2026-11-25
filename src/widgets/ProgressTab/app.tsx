import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy } from 'react';

import TabWidgetSuspense from '@src/generic/TabWidgetSuspense';
import { progressTabSlotId, type ProgressTabSlotProps } from '@src/slots/ProgressTabSlot';

export const progressTabWidgetId = 'org.openedx.frontend.widget.learning.progressTab.v1';

export type ProgressTabProps = ProgressTabSlotProps;

// Learning's slots load with the site, so the tab loads on first render, in the progress page's chunk.
const ProgressTabRoot = lazy(() => import(/* webpackChunkName: "learning-progress" */ '../../course-home/progress-tab/ProgressTab'));

export const ProgressTab = ({ courseId, targetUserId }: ProgressTabProps) => (
  <TabWidgetSuspense>
    <ProgressTabRoot courseId={courseId} targetUserId={targetUserId} />
  </TabWidgetSuspense>
);

const app: App = {
  appId: 'org.openedx.frontend.app.learning.progressTab',
  slots: [
    {
      slotId: progressTabSlotId,
      id: progressTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: ProgressTab,
    },
  ],
};

export default app;
