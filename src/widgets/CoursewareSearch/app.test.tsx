import { WidgetOperationTypes } from '@openedx/frontend-base';

import { learningCourseRole } from '@src/constants';
import slots from '@src/slots';

import coursewareSearchApp, { coursewareSearchWidgetId, LazyCoursewareSearchWidget } from './app';

describe('coursewareSearchApp', () => {
  it("appends the search widget to the course bar's extra content on Learning course routes", () => {
    expect(coursewareSearchApp.slots).toEqual([{
      slotId: 'org.openedx.frontend.slot.header.courseNavigationBar.extraContent.v1',
      id: coursewareSearchWidgetId,
      op: WidgetOperationTypes.APPEND,
      component: LazyCoursewareSearchWidget,
      condition: { active: [learningCourseRole] },
    }]);
  });

  it("is part of Learning's slot operations", () => {
    expect(slots).toEqual(expect.arrayContaining(coursewareSearchApp.slots ?? []));
  });
});
