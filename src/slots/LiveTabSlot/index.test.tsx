import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { liveTabWidgetId } from '@src/widgets/LiveTab';

import LiveTabSlot, { liveTabSlotId } from '.';

jest.mock('@src/course-home/live-tab/LiveTab', () => ({ courseId }: { courseId: string }) => `Live tab for ${courseId}`);

describe('LiveTabSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it("renders Learning's live tab widget by default", async () => {
    render(<LiveTabSlot courseId={courseId} />);

    expect(await screen.findByText(`Live tab for ${courseId}`)).toBeInTheDocument();
  });

  it("passes its props to a widget that replaces Learning's by its ID", () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: liveTabSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: liveTabWidgetId,
      component: Widget,
    }]);

    render(<LiveTabSlot courseId={courseId} />);

    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it("is empty once Learning's widget is removed by its ID", () => {
    addSlotOperations([{
      slotId: liveTabSlotId,
      op: WidgetOperationTypes.REMOVE,
      relatedId: liveTabWidgetId,
    }]);

    const { container } = render(<LiveTabSlot courseId={courseId} />);

    expect(container).toBeEmptyDOMElement();
  });
});
