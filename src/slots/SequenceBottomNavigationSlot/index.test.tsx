import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import SequenceBottomNavigationSlot, { sequenceBottomNavigationSlotId } from '.';

jest.mock('@src/courseware/course/sequence/sequence-navigation', () => ({
  UnitNavigation: ({ isAtTop }: { isAtTop: boolean }) => `Unit navigation, at top: ${isAtTop}`,
}));

describe('SequenceBottomNavigationSlot', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    unitId: 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@unit',
    onClickNext: jest.fn(),
    onNavigate: jest.fn(),
    onClickPrevious: jest.fn(),
  };

  it('renders the bottom unit navigation by default', () => {
    render(<SequenceBottomNavigationSlot {...props} />);

    expect(screen.getByText('Unit navigation, at top: false')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: sequenceBottomNavigationSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<SequenceBottomNavigationSlot {...props} />);

    expect(screen.queryByText(/Unit navigation/)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
