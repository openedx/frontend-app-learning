import React from 'react';
import { FormattedTime, useIntl } from '@edx/frontend-platform/i18n';
import { useModel } from '../../../generic/model-store';

import { useContextId } from '../../../data/hooks';
import messages from '../messages';

interface Props {
  due: string;
  id: string;
  description: string;
}

const SequenceDueDate: React.FC<Props> = ({
  due,
  id,
  description,
}) => {
  const intl = useIntl();
  const courseId = useContextId();
  let dueDateMessage: string | React.ReactNode = intl.formatMessage(
    messages.sequenceNoDueDate,
    { description: description || '' },
  );
  const {
    userTimezone,
  } = useModel('outline', courseId);

  if (due) {
    const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

    dueDateMessage = intl.formatMessage(
      messages.sequenceDueDate,
      {
        assignmentDue: (
          <FormattedTime
            key={`${id}-due`}
            day="numeric"
            month="short"
            year="numeric"
            timeZoneName="short"
            value={due}
            {...timezoneFormatArgs}
          />
        ),
        description: description || '',
      },
    );
  }

  return (
    <div className="row w-100 m-0 ml-3 pl-3">
      <small className="text-body pl-2">
        {dueDateMessage}
      </small>
    </div>
  );
};

export default SequenceDueDate;
