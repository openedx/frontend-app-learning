import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { lazy } from 'react';

import TabWidgetSuspense from '@src/generic/TabWidgetSuspense';
import { coursewareTabSlotId, type CoursewareTabSlotProps } from '@src/slots/CoursewareTabSlot';

export const coursewareTabWidgetId = 'org.openedx.frontend.widget.learning.coursewareTab.v1';

export type CoursewareTabProps = CoursewareTabSlotProps;

// Learning's slots load with the site, so the courseware loads on first render, in the courseware page's chunk.
const CoursewareContainer = lazy(() => import(/* webpackChunkName: "learning-courseware" */ '../../courseware'));

export const CoursewareTab = ({
  courseId, sequenceId, unitId, isPreview = false,
}: CoursewareTabProps) => (
  <TabWidgetSuspense>
    <CoursewareContainer courseId={courseId} sequenceId={sequenceId} unitId={unitId} isPreview={isPreview} />
  </TabWidgetSuspense>
);

const app: App = {
  appId: 'org.openedx.frontend.app.learning.coursewareTab',
  slots: [
    {
      slotId: coursewareTabSlotId,
      id: coursewareTabWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: CoursewareTab,
    },
  ],
};

export default app;
