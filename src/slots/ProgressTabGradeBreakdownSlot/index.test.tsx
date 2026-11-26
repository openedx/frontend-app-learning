import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ProgressTabGradeBreakdownSlot, { progressTabGradeBreakdownSlotId } from '.';

jest.mock('@src/course-home/progress-tab/hooks', () => ({
  useProgressData: () => ({ gradesFeatureIsFullyLocked: false }),
}));
jest.mock('@src/course-home/progress-tab/grades/grade-summary/GradeSummary', () => () => 'Grade summary');
jest.mock('@src/course-home/progress-tab/grades/detailed-grades/DetailedGrades', () => () => 'Detailed grades');

describe('ProgressTabGradeBreakdownSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it('renders the grade summary and the detailed grades by default', () => {
    render(<ProgressTabGradeBreakdownSlot courseId={courseId} />);

    expect(screen.getByText('Grade summary', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Detailed grades', { exact: false })).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressTabGradeBreakdownSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ProgressTabGradeBreakdownSlot courseId={courseId} />);

    expect(screen.queryByText('Grade summary', { exact: false })).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });
});
