import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useWindowSize, breakpoints } from '@openedx/paragon';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DateSummary from '../DateSummary';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

const CourseDates = ({
  intl,
}) => {
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
  const wideScreen = useWindowSize().width >= breakpoints.medium.minWidth;

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
            />
          ))}
        </ol>
        <a
          className={classNames('font-weight-bold ml-4 pl-1', { small: !wideScreen })}
          href={datesTabLink}
        >
          {intl.formatMessage(messages.allDates)}
        </a>
      </div>
    </section>
  );
};

CourseDates.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CourseDates);
