import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { datesTabWidgetId } from '@src/widgets/DatesTab';

import DatesTabSlot, { datesTabSlotId } from '.';

jest.mock('@src/course-home/dates-tab', () => ({ courseId }: { courseId: string }) => `Dates tab for ${courseId}`);

describe('DatesTabSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it("renders Learning's dates tab widget by default", async () => {
    render(<DatesTabSlot courseId={courseId} />);

    expect(await screen.findByText(`Dates tab for ${courseId}`)).toBeInTheDocument();
  });

  it("passes its props to a widget that replaces Learning's by its ID", () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: datesTabSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: datesTabWidgetId,
      component: Widget,
    }]);

    render(<DatesTabSlot courseId={courseId} />);

    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it("is empty once Learning's widget is removed by its ID", () => {
    addSlotOperations([{
      slotId: datesTabSlotId,
      op: WidgetOperationTypes.REMOVE,
      relatedId: datesTabWidgetId,
    }]);

    const { container } = render(<DatesTabSlot courseId={courseId} />);

    expect(container).toBeEmptyDOMElement();
  });
});
