import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { useModel } from '../model-store';

import DatesBanner from './DatesBanner';
import { fetchDatesTab, resetDeadlines } from '../data/thunks';

function DatesBannerContainer(props) {
  const {
    model,
  } = props;

  const {
    courseId,
  } = useSelector(state => state.courseware);

  const {
    datesBannerInfo,
  } = useModel(model, courseId);

  const {
    contentTypeGatingEnabled,
    missedDeadlines,
    missedGatedContent,
    verifiedUpgradeLink,
  } = datesBannerInfo;

  const {
    isSelfPaced,
  } = useModel('courseHomeMetadata', courseId);

  const dispatch = useDispatch();
  const upgradeToCompleteGraded = model === 'dates' && contentTypeGatingEnabled && !missedDeadlines;
  const upgradeToReset = !upgradeToCompleteGraded && missedDeadlines && missedGatedContent;
  const resetDates = !upgradeToCompleteGraded && missedDeadlines && !missedGatedContent;
  const datesBanners = [
    {
      name: 'datesTabInfoBanner',
      shouldDisplay: model === 'dates' && !missedDeadlines && isSelfPaced,
    },
    {
      name: 'upgradeToCompleteGradedBanner',
      shouldDisplay: upgradeToCompleteGraded,
      clickHandler: () => window.location.replace(verifiedUpgradeLink),
    },
    {
      name: 'upgradeToResetBanner',
      shouldDisplay: upgradeToReset,
      clickHandler: () => window.location.replace(verifiedUpgradeLink),
    },
    {
      name: 'resetDatesBanner',
      shouldDisplay: resetDates,
      clickHandler: () => dispatch(resetDeadlines(courseId, fetchDatesTab)),
    },
  ];

  return (
    <>
      {datesBanners.map((banner) => banner.shouldDisplay && (
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
  model: PropTypes.string.isRequired,
};

export default DatesBannerContainer;
