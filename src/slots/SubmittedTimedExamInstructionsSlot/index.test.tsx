import { WidgetOperationTypes } from '@openedx/frontend-base';
import { screen } from '@testing-library/react';

import { render } from '@src/tests/render';
import { addSlotOperations } from '@src/tests/slots';

import SubmittedTimedExamInstructionsSlot, { submittedTimedExamInstructionsSlotId } from '.';

describe('SubmittedTimedExamInstructionsSlot', () => {
  it('renders the submitted heading by default', () => {
    render(<SubmittedTimedExamInstructionsSlot timeIsOver={false} />);

    expect(screen.getByRole('heading', { name: 'You have submitted your timed exam.' })).toBeInTheDocument();
  });

  it('renders the time-is-over heading by default when the time limit submitted the exam', () => {
    render(<SubmittedTimedExamInstructionsSlot timeIsOver />);

    expect(screen.getByRole('heading', {
      name: 'The time allotted for this exam has expired. Your exam has been submitted and any work you completed will be graded.',
    })).toBeInTheDocument();
  });

  it.each([false, true])('passes timeIsOver=%s to a widget that replaces the default content', (timeIsOver) => {
    const Widget = jest.fn<null, [object]>(() => null);
    addSlotOperations([{
      slotId: submittedTimedExamInstructionsSlotId,
      id: 'org.example.widget',
      op: WidgetOperationTypes.REPLACE,
      relatedId: 'defaultContent',
      component: Widget,
    }]);

    render(<SubmittedTimedExamInstructionsSlot timeIsOver={timeIsOver} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(Widget.mock.calls[0][0]).toEqual({ timeIsOver });
  });
});
