import { WidgetOperationTypes } from '@openedx/frontend-base';

import { discussionsSidebarRole } from '@src/constants';
import slots from '@src/slots';
import { auxiliarySidebarSlotId } from '@src/slots/AuxiliarySidebarSlot';
import { auxiliarySidebarTriggerSlotId } from '@src/slots/AuxiliarySidebarTriggerSlot';
import { addExternalRoute } from '@src/tests/slots';

import discussionsSidebarApp, {
  discussionsSidebarIsAvailable, discussionsSidebarOptions, LazyDiscussionsSidebar, LazyDiscussionsTrigger,
} from './app';
import { discussionsSidebarWidgetId } from './constants';
import DiscussionsProvider from './DiscussionsProvider';

describe('discussionsSidebarApp', () => {
  it('appends the trigger and the panel to the auxiliary sidebar slots under one widget ID, and sets its options on the panel', () => {
    expect(discussionsSidebarApp.slots).toEqual([
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
        options: discussionsSidebarOptions,
      },
    ]);
  });

  it("is part of Learning's slot operations", () => {
    expect(slots).toEqual(expect.arrayContaining(discussionsSidebarApp.slots ?? []));
  });

  it('has the availability check and provider it has in the legacy app', () => {
    expect(discussionsSidebarOptions).toEqual({
      isAvailable: discussionsSidebarIsAvailable,
      Provider: DiscussionsProvider,
    });
  });
});

describe('discussionsSidebarIsAvailable', () => {
  const context = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    unitId: 'unit-1',
    course: {},
    unit: { id: 'topic-1', usageKey: 'unit-1', enabledInContext: true },
  };

  it('is available on a unit whose topic is enabled in context, when the role resolves', () => {
    addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar');

    expect(discussionsSidebarIsAvailable(context)).toBe(true);
  });

  it('is not available on a unit with no topic, or one not enabled in context', () => {
    addExternalRoute(discussionsSidebarRole, 'http://localhost:2002/discussions/sidebar');

    expect(discussionsSidebarIsAvailable({ ...context, unit: undefined })).toBe(false);
    expect(discussionsSidebarIsAvailable({ ...context, unit: { ...context.unit, enabledInContext: false } }))
      .toBe(false);
  });

  it('is not available when nothing provides the discussions sidebar role', () => {
    expect(discussionsSidebarIsAvailable(context)).toBe(false);
  });
});
