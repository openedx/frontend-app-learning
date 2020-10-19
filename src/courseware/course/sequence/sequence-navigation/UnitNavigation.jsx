import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import { getCourseExitText } from '../../course-exit';

import { useSequenceNavigationMetadata } from './hooks';
import messages from './messages';

function UnitNavigation({
  intl,
  sequenceId,
  unitId,
  onClickPrevious,
  onClickNext,
  goToCourseExitPage,
}) {
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const { courseId } = useSelector(state => state.courseware);

  const renderNextButton = () => {
    const exitText = getCourseExitText(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : onClickNext;
    const buttonText = isLastUnit && exitText ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = isLastUnit && !exitText;
    return (
      <Button variant="outline-primary" className="next-button" onClick={buttonOnClick} disabled={disabled}>
        {buttonText}
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    );
  };

  return (
    <div className="unit-navigation d-flex">
      <Button
        variant="outline-secondary"
        className="previous-button mr-2"
        disabled={isFirstUnit}
        onClick={onClickPrevious}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        {intl.formatMessage(messages.previousButton)}
      </Button>
      {renderNextButton()}
    </div>
  );
}

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
