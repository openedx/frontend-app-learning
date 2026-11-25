import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import NextUnitTopNavTriggerSlot, { nextUnitTopNavTriggerSlotId } from '.';

jest.mock(
  '@src/courseware/course/sequence/sequence-navigation/generic/NextButton',
  () => ({ buttonText }: { buttonText: string }) => `Next button: ${buttonText}`,
);

describe('NextUnitTopNavTriggerSlot', () => {
  const props = {
    disabled: false,
    buttonText: 'Next',
    nextLink: '/learning/course/course-v1:edX+DemoX+Demo_Course/sequence/unit',
    sequenceId: 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@sequence',
    onClickHandler: jest.fn(),
    variant: 'outline-primary',
    buttonStyle: 'next-button',
    isAtTop: true,
  };

  it('renders the next button by default', () => {
    render(<NextUnitTopNavTriggerSlot {...props} />);

    expect(screen.getByText('Next button: Next')).toBeInTheDocument();
  });

  it('passes its props to a widget that replaces the default content', () => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: nextUnitTopNavTriggerSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<NextUnitTopNavTriggerSlot {...props} />);

    expect(screen.queryByText(/Next button/)).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual(props);
  });
});
