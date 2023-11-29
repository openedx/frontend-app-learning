import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@edx/paragon';
import { ArrowForwardIos, ArrowBackIos } from '@edx/paragon/icons';

import {
  injectIntl, intlShape, isRtl, getLocale,
} from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import { GetCourseExitNavigation } from '../../course-exit';

import UnitNavigationEffortEstimate from './UnitNavigationEffortEstimate';
import { useSequenceNavigationMetadata } from './hooks';
import messages from './messages';

const UnitNavigation = ({
  intl,
  sequenceId,
  unitId,
  onClickPrevious,
  onClickNext,
  goToCourseExitPage,
}) => {
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const { courseId } = useSelector(state => state.courseware);

  const renderNextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : onClickNext;
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitActive;
    const nextArrow = isRtl(getLocale()) ? ArrowBackIos : ArrowForwardIos;
    return (
      <Button
        variant="outline-default"
        className="next-button d-flex align-items-center justify-content-center"
        onClick={buttonOnClick}
        disabled={disabled}
      >
        <UnitNavigationEffortEstimate sequenceId={sequenceId} unitId={unitId}>
          {buttonText}
        </UnitNavigationEffortEstimate>
        <Icon src={nextArrow} className="ml-3" style={{ height: '18px', width: '18px' }} />
      </Button>
    );
  };

  const prevArrow = isRtl(getLocale()) ? ArrowForwardIos : ArrowBackIos;
  return (
    <div className="unit-navigation d-flex">
      <Button
        variant="outline-default"
        className="previous-button mr-2 d-flex align-items-center justify-content-center"
        disabled={isFirstUnit}
        onClick={onClickPrevious}
      >
        <Icon src={prevArrow} className="mr-3" style={{ height: '18px', width: '18px' }} />
        {intl.formatMessage(messages.previousButton)}
      </Button>
      {renderNextButton()}
    </div>
  );
};

UnitNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  onClickPrevious: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
};

UnitNavigation.defaultProps = {
  unitId: null,
};

export default injectIntl(UnitNavigation);
