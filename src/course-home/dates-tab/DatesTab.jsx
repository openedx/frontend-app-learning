import React from 'react';
import { useParams } from 'react-router-dom';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import Timeline from './timeline/Timeline';

import { useCourseHomeMeta, useDatesTabData } from '../data/apiHooks';
import { useModel } from '../../generic/model-store';
import { TabWithTimer } from '../../tab-page';

import SuggestedScheduleHeader from '../suggested-schedule-messaging/SuggestedScheduleHeader';
import ShiftDatesAlert from '../suggested-schedule-messaging/ShiftDatesAlert';
import { BannerDatesUpgradeSlot } from '../../plugin-slots/BannerDatesUpgradeSlot';
import UpgradeToShiftDatesAlert from '../suggested-schedule-messaging/UpgradeToShiftDatesAlert';

const DatesTab = () => {
  const intl = useIntl();
  const { courseId } = useParams();

  const metadataQuery = useCourseHomeMeta(courseId);
  const tabDataQuery = useDatesTabData(courseId);

  const {
    isSelfPaced,
    org,
  } = useModel('courseHomeMeta', courseId);

  const {
    courseDateBlocks,
  } = useModel('dates', courseId);

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
    <TabWithTimer
      activeTabSlug="dates"
      courseId={courseId}
      courseStatus={{ metadataQuery, tabDataQuery }}
      metadataModel="courseHomeMeta"
    >
      <div role="heading" aria-level="1" className="h2 my-3">
        {intl.formatMessage(messages.title)}
      </div>
      {isSelfPaced && hasDeadlines && (
        <>
          <ShiftDatesAlert model="dates" />
          <SuggestedScheduleHeader />
          <BannerDatesUpgradeSlot courseId={courseId} logUpgradeLinkClick={logUpgradeLinkClick} />
          <UpgradeToShiftDatesAlert logUpgradeLinkClick={logUpgradeLinkClick} model="dates" />
        </>
      )}
      <Timeline />
    </TabWithTimer>
  );
};

export default DatesTab;
