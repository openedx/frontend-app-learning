import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import messages from './messages';

interface Props {
  timeIsOver: boolean;
}

export const SubmittedTimedExamInstructionsSlot: React.FC<Props> = ({ timeIsOver }) => {
  const { formatMessage } = useIntl();
  return (
    <PluginSlot
      id="org.openedx.frontend.special_exams.submitted_timed_exam_instructions.v1"
      pluginProps={{ timeIsOver }}
    >
      <h3 className="h3" data-testid="exam.submittedExamInstructions.title">
        {formatMessage(timeIsOver ? messages.overtimeTitle : messages.title)}
      </h3>
    </PluginSlot>
  );
};
