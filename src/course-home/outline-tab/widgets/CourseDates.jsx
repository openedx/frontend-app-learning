import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DateSummary from '../DateSummary';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

function CourseDates({
  intl,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
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
      <div id="courseHome-dates">
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
      </div>
    </section>
  );
}

CourseDates.propTypes = {
  intl: intlShape.isRequired,
  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({}),
};

CourseDates.defaultProps = {
  /** [MM-P2P] Experiment */
  mmp2p: {},
};

export default injectIntl(CourseDates);
