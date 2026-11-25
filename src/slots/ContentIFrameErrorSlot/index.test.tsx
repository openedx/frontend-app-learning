import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import ContentIFrameErrorSlot, { contentIFrameErrorSlotId } from '.';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  ErrorPage: () => 'Error page',
}));

describe('ContentIFrameErrorSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';

  it('renders the error page by default', () => {
    render(<ContentIFrameErrorSlot courseId={courseId} unitId={unitId} />);

    expect(screen.getByText('Error page')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: contentIFrameErrorSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<ContentIFrameErrorSlot courseId={courseId} unitId={unitId} />);

    expect(screen.queryByText('Error page')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, unitId });
  });
});
