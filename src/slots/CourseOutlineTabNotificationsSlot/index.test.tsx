import { WidgetOperationTypes } from '@openedx/frontend-base';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseOutlineTabNotificationsSlot, { courseOutlineTabNotificationsSlotId } from '.';

describe('CourseOutlineTabNotificationsSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders nothing by default', () => {
    const { container } = render(<CourseOutlineTabNotificationsSlot courseId={courseId} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('passes its props to an appended widget', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseOutlineTabNotificationsSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.APPEND,
      component: Widget,
    }]);

    render(<CourseOutlineTabNotificationsSlot courseId={courseId} />);

    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
