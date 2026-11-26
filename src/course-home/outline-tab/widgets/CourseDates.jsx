import React from 'react';

import { getLinkProps, useIntl } from '@openedx/frontend-base';
import { Hyperlink } from '@openedx/paragon';

import DateSummary from '../DateSummary';
import messages from '../messages';
import { useCourseHomeMeta, useOutlineTabData } from '../../data/apiHooks';
import { useDatesTabUrl } from '../../../course-tabs/hooks';
import { useCourseId } from '@src/generic/course-params';

const CourseDates = () => {
  const intl = useIntl();
  const courseId = useCourseId();
  const userTimezone = useCourseHomeMeta(courseId, { enabled: false }).data?.userTimezone;
  const {
    datesWidget: {
      courseDateBlocks,
    },
  } = useOutlineTabData(courseId, { enabled: false }).data;
  const datesTabLink = useDatesTabUrl();

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
        {datesTabLink && (
          <Hyperlink id="dates-tab-link" className="font-weight-bold ml-4 pl-1 small" {...getLinkProps(datesTabLink)}>
            {intl.formatMessage(messages.allDates)}
          </Hyperlink>
        )}
      </div>
    </section>
  );
};

export default CourseDates;
