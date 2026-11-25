import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { progressTabWidgetId } from '@src/widgets/ProgressTab';

import ProgressTabSlot, { progressTabSlotId } from '.';

jest.mock('@src/course-home/progress-tab/ProgressTab', () => () => 'Progress tab');

describe('ProgressTabSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const targetUserId = '42';

  it("renders Learning's progress tab widget by default", async () => {
    render(<ProgressTabSlot courseId={courseId} />);

    expect(await screen.findByText('Progress tab')).toBeInTheDocument();
  });

  it.each([
    ['the learner', { courseId }],
    ['another learner', { courseId, targetUserId }],
  ])('passes its props to a widget that replaces the progress tab, for %s', (_name, props) => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: progressTabSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: progressTabWidgetId,
      component: Widget,
    }]);

    render(<ProgressTabSlot {...props} />);

    expect(screen.queryByText('Progress tab')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });

  it('renders nothing once the progress tab is removed', () => {
    addSlotOperations([{
      slotId: progressTabSlotId,
      op: WidgetOperationTypes.REMOVE,
      relatedId: progressTabWidgetId,
    }]);

    const { container } = render(<ProgressTabSlot courseId={courseId} />);

    expect(container).toBeEmptyDOMElement();
  });
});
