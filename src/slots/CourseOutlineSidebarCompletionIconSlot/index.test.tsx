import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseOutlineSidebarCompletionIconSlot, { courseOutlineSidebarCompletionIconSlotId } from '.';

jest.mock('@src/courseware/course/sidebar/sidebars/course-outline/components/CompletionIcon', () => ({
  CompletionIcon: ({ completionStat, enabled }: { completionStat: { completed: number; total: number }; enabled: boolean }) => (
    `Completion icon: ${completionStat.completed}/${completionStat.total}, enabled: ${enabled}`
  ),
}));

describe('CourseOutlineSidebarCompletionIconSlot', () => {
  const props = {
    completionStat: { completed: 2, total: 5 },
    enabled: true,
    active: false,
    variant: 'section' as const,
  };

  it('renders the completion icon by default', () => {
    render(<CourseOutlineSidebarCompletionIconSlot {...props} />);

    expect(screen.getByText('Completion icon: 2/5, enabled: true')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseOutlineSidebarCompletionIconSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<CourseOutlineSidebarCompletionIconSlot {...props} />);

    expect(screen.queryByText(/Completion icon/)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
