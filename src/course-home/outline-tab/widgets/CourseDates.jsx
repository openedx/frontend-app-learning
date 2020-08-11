import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DateSummary from '../DateSummary';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function CourseDates({ courseId, intl }) {
  const {
    datesWidget,
  } = useModel('outline', courseId);

  return (
    <section className="mb-3">
      <h2 className="h6">{intl.formatMessage(messages.dates)}</h2>
      {datesWidget.courseDateBlocks.map((courseDateBlock) => (
        <DateSummary
          key={courseDateBlock.title + courseDateBlock.date}
          dateBlock={courseDateBlock}
          userTimezone={datesWidget.userTimezone}
        />
      ))}
      <a className="font-weight-bold ml-4 pl-2" href={datesWidget.datesTabLink}>
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
