import { WidgetOperationTypes } from '@openedx/frontend-base';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import SequenceNavigationSlot, { sequenceNavigationSlotId } from '.';

describe('SequenceNavigationSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
    nextHandler: jest.fn(),
    onNavigate: jest.fn(),
    previousHandler: jest.fn(),
  };

  it('renders nothing by default', () => {
    const { container } = render(<SequenceNavigationSlot {...props} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('passes its props to an appended widget', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: sequenceNavigationSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.APPEND,
      component: Widget,
    }]);

    render(<SequenceNavigationSlot {...props} />);

    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
