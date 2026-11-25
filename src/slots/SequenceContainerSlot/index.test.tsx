import { WidgetOperationTypes } from '@openedx/frontend-base';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import SequenceContainerSlot, { sequenceContainerSlotId } from '.';

describe('SequenceContainerSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';

  it('renders nothing by default', () => {
    const { container } = render(<SequenceContainerSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('passes its props to an appended widget', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: sequenceContainerSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.APPEND,
      component: Widget,
    }]);

    render(<SequenceContainerSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />);

    expect(Widget.mock.calls[0][0]).toEqual({ courseId, sequenceId, unitId });
  });
});
