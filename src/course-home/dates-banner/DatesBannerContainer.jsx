import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { useModel } from '../../generic/model-store';

import DatesBanner from './DatesBanner';
import { resetDeadlines } from '../data';

function DatesBannerContainer({
  courseDateBlocks,
  datesBannerInfo,
  hasEnded,
  logUpgradeLinkClick,
  model,
  tabFetch,
}) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    contentTypeGatingEnabled,
    missedDeadlines,
    missedGatedContent,
    verifiedUpgradeLink,
  } = datesBannerInfo;

  const {
    isSelfPaced,
  } = useModel('courseHomeMeta', courseId);

  const dispatch = useDispatch();
  const hasDeadlines = courseDateBlocks.some(x => x.dateType === 'assignment-due-date');
  const upgradeToCompleteGraded = model === 'dates' && contentTypeGatingEnabled && !missedDeadlines;
  const upgradeToReset = !upgradeToCompleteGraded && missedDeadlines && missedGatedContent;
  const resetDates = !upgradeToCompleteGraded && missedDeadlines && !missedGatedContent;
  const datesBanners = [
    {
      name: 'datesTabInfoBanner',
      shouldDisplay: model === 'dates' && hasDeadlines && !missedDeadlines && isSelfPaced,
    },
    {
      name: 'upgradeToCompleteGradedBanner',
      // verifiedUpgradeLink can be null if we've passed the upgrade deadline
      shouldDisplay: upgradeToCompleteGraded && verifiedUpgradeLink,
      clickHandler: () => {
        logUpgradeLinkClick();
        global.location.replace(verifiedUpgradeLink);
      },
    },
    {
      name: 'upgradeToResetBanner',
      // verifiedUpgradeLink can be null if we've passed the upgrade deadline
      shouldDisplay: upgradeToReset && verifiedUpgradeLink,
      clickHandler: () => {
        logUpgradeLinkClick();
        global.location.replace(verifiedUpgradeLink);
      },
    },
    {
      name: 'resetDatesBanner',
      shouldDisplay: resetDates,
      clickHandler: () => dispatch(resetDeadlines(courseId, model, tabFetch)),
    },
  ];

  return (
    <>
      {!hasEnded && datesBanners.map((banner) => banner.shouldDisplay && (
        <DatesBanner
          name={banner.name}
          bannerClickHandler={banner.clickHandler}
          key={banner.name}
        />
      ))}
    </>
  );
}

DatesBannerContainer.propTypes = {
  courseDateBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
  datesBannerInfo: PropTypes.shape({
    contentTypeGatingEnabled: PropTypes.bool.isRequired,
    missedDeadlines: PropTypes.bool.isRequired,
    missedGatedContent: PropTypes.bool.isRequired,
    verifiedUpgradeLink: PropTypes.string,
  }).isRequired,
  hasEnded: PropTypes.bool,
  logUpgradeLinkClick: PropTypes.func,
  model: PropTypes.string.isRequired,
  tabFetch: PropTypes.func.isRequired,
};

DatesBannerContainer.defaultProps = {
  hasEnded: false,
  logUpgradeLinkClick: () => {},
};

export default DatesBannerContainer;
