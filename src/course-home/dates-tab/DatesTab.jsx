import React from 'react';
import { useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
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
    org,
  } = useModel('courseHomeMeta', courseId);

  const {
    courseDateBlocks,
    datesBannerInfo,
    hasEnded,
  } = useModel('dates', courseId);

  /** [MM-P2P] Experiment */
  const mmp2p = initDatesMMP2P(courseId);

  const logUpgradeLinkClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      org_key: org,
      courserun_key: courseId,
      linkCategory: 'personalized_learner_schedules',
      linkName: 'dates_upgrade',
      linkType: 'button',
      pageName: 'dates_tab',
    });
  };

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
          logUpgradeLinkClick={logUpgradeLinkClick}
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
