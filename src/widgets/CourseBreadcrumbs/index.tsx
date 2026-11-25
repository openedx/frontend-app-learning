import {
  useWidgetOptions, WidgetOperationTypes, type WidgetAppendOperation,
} from '@openedx/frontend-base';

import CourseBreadcrumbs from '@src/courseware/course/breadcrumbs';
import { courseBreadcrumbsSlotId, type CourseBreadcrumbsSlotProps } from '@src/slots/CourseBreadcrumbsSlot';

export const courseBreadcrumbsWidgetId = 'org.openedx.frontend.widget.learning.courseBreadcrumbs.v1';

// The breadcrumbs, with staff's jump navigation menu when the widget's `jumpNav` option is true.
const CourseBreadcrumbsWidget = ({
  courseId, sectionId, sequenceId, unitId, isStaff,
}: CourseBreadcrumbsSlotProps) => {
  const { jumpNav } = useWidgetOptions();
  return (
    <CourseBreadcrumbs
      courseId={courseId}
      sectionId={sectionId}
      sequenceId={sequenceId}
      unitId={unitId}
      isStaff={isStaff}
      jumpNav={jumpNav === true}
    />
  );
};

export const courseBreadcrumbsSlotOperation: WidgetAppendOperation = {
  slotId: courseBreadcrumbsSlotId,
  id: courseBreadcrumbsWidgetId,
  op: WidgetOperationTypes.APPEND,
  component: CourseBreadcrumbsWidget as React.ComponentType,
};
