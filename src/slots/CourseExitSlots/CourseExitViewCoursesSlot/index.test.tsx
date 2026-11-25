import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseExitViewCoursesSlot, { courseExitViewCoursesSlotId } from '.';

jest.mock('@src/courseware/course/course-exit/ViewCoursesButton', () => () => 'View courses');

describe('CourseExitViewCoursesSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders the view-courses button by default', () => {
    render(<CourseExitViewCoursesSlot courseId={courseId} />);

    expect(screen.getByText('View courses')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseExitViewCoursesSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseExitViewCoursesSlot courseId={courseId} />);

    expect(screen.queryByText('View courses')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
