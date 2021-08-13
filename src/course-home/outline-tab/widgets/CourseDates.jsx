import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DateSummary from '../DateSummary';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function CourseDates({
  courseId,
  intl,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const {
    userTimezone,
  } = useModel('courseHomeMeta', courseId);
  const {
    datesWidget: {
      courseDateBlocks,
      datesTabLink,
    },
  } = useModel('outline', courseId);

  if (courseDateBlocks.length === 0) {
    return null;
  }

  return (
    <section className="mb-4">
      <h2 className="h4">{intl.formatMessage(messages.dates)}</h2>
      <ol className="list-unstyled">
        {courseDateBlocks.map((courseDateBlock) => (
          <DateSummary
            key={courseDateBlock.title + courseDateBlock.date}
            dateBlock={courseDateBlock}
            userTimezone={userTimezone}
            /** [MM-P2P] Experiment */
            mmp2p={mmp2p}
          />
        ))}
      </ol>
      <a className="font-weight-bold ml-4 pl-1 small" href={datesTabLink}>
        {intl.formatMessage(messages.allDates)}
      </a>
    </section>
  );
}

CourseDates.propTypes = {
  courseId: PropTypes.string,
  intl: intlShape.isRequired,
  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({}),
};

CourseDates.defaultProps = {
  courseId: null,
  /** [MM-P2P] Experiment */
  mmp2p: {},
};

export default injectIntl(CourseDates);
