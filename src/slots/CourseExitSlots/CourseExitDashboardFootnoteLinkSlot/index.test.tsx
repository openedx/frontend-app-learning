import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseExitDashboardFootnoteLinkSlot, { courseExitDashboardFootnoteLinkSlotId } from '.';

jest.mock(
  '@src/courseware/course/course-exit/DashboardFootnoteLink',
  () => ({ courseId, variant }: { courseId: string; variant: string }) => `Dashboard link (${courseId}, ${variant})`,
);

describe('CourseExitDashboardFootnoteLinkSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const variant = 'nonpassing';

  it('renders the dashboard link by default', () => {
    render(<CourseExitDashboardFootnoteLinkSlot courseId={courseId} variant={variant} />);

    expect(screen.getByText(`Dashboard link (${courseId}, ${variant})`)).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseExitDashboardFootnoteLinkSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseExitDashboardFootnoteLinkSlot courseId={courseId} variant={variant} />);

    expect(screen.queryByText(`Dashboard link (${courseId}, ${variant})`)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, variant });
  });
});
