import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';
import { outlineTabWidgetId } from '@src/widgets/OutlineTab';

import OutlineTabSlot, { outlineTabSlotId } from '.';

jest.mock('@src/course-home/outline-tab', () => ({ courseId }: { courseId: string }) => `Outline of ${courseId}`);

describe('OutlineTabSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it("renders Learning's outline tab widget by default", async () => {
    render(<OutlineTabSlot courseId={courseId} />);

    expect(await screen.findByText(`Outline of ${courseId}`)).toBeInTheDocument();
  });

  it("passes its props to a widget that replaces Learning's", () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: outlineTabSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: outlineTabWidgetId,
      component: Widget,
    }]);

    render(<OutlineTabSlot courseId={courseId} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId });
  });

  it("leaves the slot empty when Learning's widget is removed", () => {
    addSlotOperations([{
      slotId: outlineTabSlotId,
      op: WidgetOperationTypes.REMOVE,
      relatedId: outlineTabWidgetId,
    }]);

    const { container } = render(<OutlineTabSlot courseId={courseId} />);

    expect(container).toBeEmptyDOMElement();
  });
});
