import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseOutlineSidebarSlot, { courseOutlineSidebarSlotId } from '.';

jest.mock('@src/courseware/course/sidebar/sidebars/course-outline/CourseOutlineTray', () => () => 'Course outline tray');

describe('CourseOutlineSidebarSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
  };

  it('renders the course outline tray by default', () => {
    render(<CourseOutlineSidebarSlot {...props} />);

    expect(screen.getByText('Course outline tray')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseOutlineSidebarSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseOutlineSidebarSlot {...props} />);

    expect(screen.queryByText('Course outline tray')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
