import { WidgetOperationTypes } from '@openedx/frontend-base';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import CourseBreadcrumbsSlot, { courseBreadcrumbsSlotId } from '.';

describe('CourseBreadcrumbsSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sectionId: 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@section',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
    isStaff: false,
  };

  it('renders nothing by default', () => {
    const { container } = render(<CourseBreadcrumbsSlot {...props} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('passes its props to an appended widget', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: courseBreadcrumbsSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.APPEND,
      component: Widget,
    }]);

    render(<CourseBreadcrumbsSlot {...props} />);

    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
