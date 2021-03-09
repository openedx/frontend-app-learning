import React from 'react';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import Timeline from './Timeline';
import DatesBannerContainer from '../dates-banner/DatesBannerContainer';

import { fetchDatesTab } from '../data';
import { useModel } from '../../generic/model-store';

/** [MM-P2P] Experiment */
import { initDatesMMP2P } from '../../experiments/mm-p2p';

function DatesTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    courseDateBlocks,
    datesBannerInfo,
    hasEnded,
  } = useModel('dates', courseId);

  const mmp2p = initDatesMMP2P(courseId);

  return (
    <>
      <div role="heading" aria-level="1" className="h2 my-3">
        {intl.formatMessage(messages.title)}
      </div>
      { /** [MM-P2P] Experiment */ }
      { !mmp2p.state.isEnabled && (
        <DatesBannerContainer
          courseDateBlocks={courseDateBlocks}
          datesBannerInfo={datesBannerInfo}
          hasEnded={hasEnded}
          model="dates"
          tabFetch={fetchDatesTab}
        />
      ) }
      <Timeline mmp2p={mmp2p} />
    </>
  );
}

DatesTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DatesTab);
