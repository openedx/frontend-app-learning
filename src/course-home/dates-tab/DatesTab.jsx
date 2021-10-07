import React from 'react';
import { useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import Timeline from './timeline/Timeline';

import { fetchDatesTab } from '../data';
import { useModel } from '../../generic/model-store';

/** [MM-P2P] Experiment */
import { initDatesMMP2P } from '../../experiments/mm-p2p';
import SuggestedScheduleHeader from '../suggested-schedule-messaging/SuggestedScheduleHeader';
import ShiftDatesAlert from '../suggested-schedule-messaging/ShiftDatesAlert';
import UpgradeToCompleteAlert from '../suggested-schedule-messaging/UpgradeToCompleteAlert';
import UpgradeToShiftDatesAlert from '../suggested-schedule-messaging/UpgradeToShiftDatesAlert';

function DatesTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    isSelfPaced,
    org,
  } = useModel('courseHomeMeta', courseId);

  const {
    courseDateBlocks,
  } = useModel('dates', courseId);

  /** [MM-P2P] Experiment */
  const mmp2p = initDatesMMP2P(courseId);

  const hasDeadlines = courseDateBlocks && courseDateBlocks.some(x => x.dateType === 'assignment-due-date');

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
      {isSelfPaced && hasDeadlines && !mmp2p.state.isEnabled && (
        <>
          <ShiftDatesAlert model="dates" fetch={fetchDatesTab} />
          <SuggestedScheduleHeader />
          <UpgradeToCompleteAlert logUpgradeLinkClick={logUpgradeLinkClick} />
          <UpgradeToShiftDatesAlert logUpgradeLinkClick={logUpgradeLinkClick} model="dates" />
        </>
      )}
      <Timeline mmp2p={mmp2p} />
    </>
  );
}

DatesTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DatesTab);
