import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import GatedUnitContentMessageSlot, { gatedUnitContentMessageSlotId } from '.';

jest.mock('@src/courseware/course/sequence/lock-paywall', () => () => 'Lock paywall');

describe('GatedUnitContentMessageSlot', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit';

  it('renders the lock paywall by default', () => {
    render(<GatedUnitContentMessageSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />);

    expect(screen.getByText('Lock paywall')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: gatedUnitContentMessageSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<GatedUnitContentMessageSlot courseId={courseId} sequenceId={sequenceId} unitId={unitId} />);

    expect(screen.queryByText('Lock paywall')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ courseId, sequenceId, unitId });
  });
});
