import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ProgressTabCourseGradeSlot, { progressTabCourseGradeSlotId } from '.';

jest.mock('@src/course-home/progress-tab/grades/course-grade/CourseGrade', () => () => 'Course grade');

describe('ProgressTabCourseGradeSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders the course grade by default', () => {
    render(<ProgressTabCourseGradeSlot courseId={courseId} />);

    expect(screen.getByText('Course grade')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressTabCourseGradeSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ProgressTabCourseGradeSlot courseId={courseId} />);

    expect(screen.queryByText('Course grade')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
