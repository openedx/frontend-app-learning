import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseOutlineSidebarUnitSlot, { courseOutlineSidebarUnitSlotId } from '.';

jest.mock(
  '@src/courseware/course/sidebar/sidebars/course-outline/components/SidebarUnitContent',
  () => ({ title, isComplete }: { title: string; isComplete: boolean }) => `Unit content: ${title}, complete: ${isComplete}`,
);

describe('CourseOutlineSidebarUnitSlot', () => {
  const props = {
    unit: {
      id: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
      title: 'Unit title',
      complete: true,
      icon: 'video',
      type: 'vertical',
    },
    icon: 'Unit icon',
    isLocked: false,
    isCompletionTrackingEnabled: true,
  };

  it('renders the unit content by default', () => {
    render(<CourseOutlineSidebarUnitSlot {...props} />);

    expect(screen.getByText('Unit content: Unit title, complete: true')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseOutlineSidebarUnitSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseOutlineSidebarUnitSlot {...props} />);

    expect(screen.queryByText(/Unit content/)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
