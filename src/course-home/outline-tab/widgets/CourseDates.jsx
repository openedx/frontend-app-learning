import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DateSummary from '../DateSummary';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function CourseDates({ courseId, intl }) {
  const {
    datesWidget: {
      courseDateBlocks,
      datesTabLink,
      userTimezone,
    },
  } = useModel('outline', courseId);

  return (
    <section className="mb-4">
      <h2 className="h6">{intl.formatMessage(messages.dates)}</h2>
      {courseDateBlocks.map((courseDateBlock) => (
        <DateSummary
          key={courseDateBlock.title + courseDateBlock.date}
          dateBlock={courseDateBlock}
          userTimezone={userTimezone}
        />
      ))}
      <a className="font-weight-bold ml-4 pl-1" href={datesTabLink}>
        {intl.formatMessage(messages.allDates)}
      </a>
    </section>
  );
}

CourseDates.propTypes = {
  courseId: PropTypes.string,
  intl: intlShape.isRequired,
};

CourseDates.defaultProps = {
  courseId: null,
};

export default injectIntl(CourseDates);
