import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseOutlineSidebarHeadingSlot, { courseOutlineSidebarHeadingSlotId } from '.';

jest.mock('@src/courseware/course/sidebar/sidebars/course-outline/components/CourseOutlineHeading', () => ({
  CourseOutlineHeading: ({ isDisplaySequenceLevel }: { isDisplaySequenceLevel: boolean }) => (
    `Course outline heading, sequence level: ${isDisplaySequenceLevel}`
  ),
}));

describe('CourseOutlineSidebarHeadingSlot', () => {
  const props = {
    onToggleCollapse: jest.fn(),
    isDisplaySequenceLevel: true,
    backButton: { title: 'Section title', onClick: jest.fn() },
  };

  it('renders the course outline heading by default', () => {
    render(<CourseOutlineSidebarHeadingSlot {...props} />);

    expect(screen.getByText('Course outline heading, sequence level: true')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseOutlineSidebarHeadingSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseOutlineSidebarHeadingSlot {...props} />);

    expect(screen.queryByText(/Course outline heading/)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
