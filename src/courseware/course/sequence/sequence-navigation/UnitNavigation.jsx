import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';

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
  const {
    courseExitPageIsActive,
    userHasPassingGrade,
  } = useModel('courses', courseId);

  const renderNextButton = () => {
    // AA-198: The userHasPassingGrade condition can be removed once we have a view for learners with failing grades
    const buttonOnClick = (isLastUnit && courseExitPageIsActive && userHasPassingGrade
      ? goToCourseExitPage : onClickNext);
    // AA-198: The userHasPassingGrade condition can be removed once we have a view for learners with failing grades
    const disabled = isLastUnit && (!courseExitPageIsActive || !userHasPassingGrade);

    // This is just to support what used to show while we are getting courseExitPageIsActive turned on.
    // This should be good to remove once disabled goes away.
    if (disabled) {
      return (
        <div className="m-2">
          <span role="img" aria-hidden="true">&#129303;</span> {/* This is a hugging face emoji */}
          {' '}
          {intl.formatMessage(messages.endOfCourse)}
        </div>
      );
    }

    let buttonText = (intl.formatMessage(messages.nextButton));
    if (isLastUnit && courseExitPageIsActive && userHasPassingGrade) {
      buttonText = (intl.formatMessage(messages.completeCourseButton));
    }
    // AA-198: Uncomment once there is a view for learners with failing grades
    // else if (isLastUnit && courseExitPageIsActive && !userHasPassingGrade) {
    //   buttonText = (`${intl.formatMessage(messages.nextButton)} (${intl.formatMessage(messages.endOfCourse)})`);
    // }
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
