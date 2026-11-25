import { Slot, useIntl } from '@openedx/frontend-base';

import messages from './messages';

export const submittedTimedExamInstructionsSlotId = 'org.openedx.frontend.slot.learning.submittedTimedExamInstructions.v1';

export interface SubmittedTimedExamInstructionsSlotProps {
  timeIsOver: boolean;
}

// Passed to the special exams library's `SequenceExamWrapper`, which renders it once a timed exam is submitted.
const SubmittedTimedExamInstructionsSlot = ({ timeIsOver }: SubmittedTimedExamInstructionsSlotProps) => {
  const { formatMessage } = useIntl();
  return (
    <Slot id={submittedTimedExamInstructionsSlotId} timeIsOver={timeIsOver}>
      <h3 className="h3" data-testid="exam.submittedExamInstructions.title">
        {formatMessage(timeIsOver ? messages.overtimeTitle : messages.title)}
      </h3>
    </Slot>
  );
};

export default SubmittedTimedExamInstructionsSlot;
