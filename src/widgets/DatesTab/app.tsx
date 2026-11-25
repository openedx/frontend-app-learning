import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy } from 'react';

import TabWidgetSuspense from '@src/generic/TabWidgetSuspense';
import { datesTabSlotId, type DatesTabSlotProps } from '@src/slots/DatesTabSlot';

export const datesTabWidgetId = 'org.openedx.frontend.widget.learning.datesTab.v1';

export type DatesTabProps = DatesTabSlotProps;

// Learning's slots load with the site, so the tab loads on first render, in the dates page's chunk.
const DatesTabRoot = lazy(() => import(/* webpackChunkName: "learning-dates" */ '../../course-home/dates-tab'));

export const DatesTab = ({ courseId }: DatesTabProps) => (
  <TabWidgetSuspense>
    <DatesTabRoot courseId={courseId} />
  </TabWidgetSuspense>
);

const app: App = {
  appId: 'org.openedx.frontend.app.learning.datesTab',
  slots: [
    {
      slotId: datesTabSlotId,
      id: datesTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: DatesTab,
    },
  ],
};

export default app;
