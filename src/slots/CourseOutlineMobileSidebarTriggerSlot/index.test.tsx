import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseOutlineMobileSidebarTriggerSlot, { courseOutlineMobileSidebarTriggerSlotId } from '.';

jest.mock(
  '@src/courseware/course/sidebar/sidebars/course-outline/CourseOutlineTrigger',
  () => ({ isMobileView }: { isMobileView: boolean }) => `Course outline trigger, mobile: ${isMobileView}`,
);

describe('CourseOutlineMobileSidebarTriggerSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
  };

  it('renders the mobile course outline trigger by default', () => {
    render(<CourseOutlineMobileSidebarTriggerSlot {...props} />);

    expect(screen.getByText('Course outline trigger, mobile: true')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseOutlineMobileSidebarTriggerSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseOutlineMobileSidebarTriggerSlot {...props} />);

    expect(screen.queryByText(/Course outline trigger/)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
