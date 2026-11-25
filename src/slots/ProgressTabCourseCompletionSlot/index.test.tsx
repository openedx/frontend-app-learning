import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ProgressTabCourseCompletionSlot, { progressTabCourseCompletionSlotId } from '.';

jest.mock('@src/course-home/progress-tab/course-completion/CourseCompletion', () => () => 'Course completion');

describe('ProgressTabCourseCompletionSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders the course completion chart by default when the graph is enabled', () => {
    render(<ProgressTabCourseCompletionSlot courseId={courseId} enableProgressGraph />);

    expect(screen.getByText('Course completion')).toBeInTheDocument();
  });

  it('renders nothing by default when the graph is disabled', () => {
    render(<ProgressTabCourseCompletionSlot courseId={courseId} enableProgressGraph={false} />);

    expect(screen.queryByText('Course completion')).not.toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressTabCourseCompletionSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ProgressTabCourseCompletionSlot courseId={courseId} enableProgressGraph />);

    expect(screen.queryByText('Course completion')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, enableProgressGraph: true });
  });
});
