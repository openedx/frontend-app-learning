import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import UnitContentSlot, { unitContentSlotId } from '.';

describe('UnitContentSlot', () => {
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';
  const iframeUrlParams = {
    id: unitId,
    view: 'student_view',
    format: null,
    examAccess: { blockAccess: false, accessToken: '' },
    preview: false,
  };
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId,
    title: 'Unit title',
    elementId: 'unit-iframe',
    iframeUrl: `http://localhost:18000/xblock/${unitId}`,
    iframeUrlParams,
    loadingMessage: 'Loading learning sequence...',
    shouldShowContent: true,
    onLoaded: jest.fn(),
  };

  it('renders the content its caller gives it by default', () => {
    render(<UnitContentSlot {...props}><p>Unit content</p></UnitContentSlot>);

    expect(screen.getByText('Unit content')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: unitContentSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<UnitContentSlot {...props}><p>Unit content</p></UnitContentSlot>);

    expect(screen.queryByText('Unit content')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
