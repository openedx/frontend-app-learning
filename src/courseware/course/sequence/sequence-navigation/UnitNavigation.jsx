import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';

export default function UnitNavigation(props) {
  const {
    sequenceId,
    unitId,
    onClickPrevious,
    onClickNext,
    goToCourseExitPage,
  } = props;

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
          <FormattedMessage
            id="learn.end.of.course"
            description="Message shown to students in place of a 'Next' button when they're at the end of a course."
            defaultMessage="You've reached the end of this course!"
          />
        </div>
      );
    }

    let buttonText = (
      <FormattedMessage
        id="learn.sequence.navigation.after.unit.next"
        description="The button to go to the next unit"
        defaultMessage="Next"
      />
    );
    if (isLastUnit && courseExitPageIsActive && userHasPassingGrade) {
      buttonText = (
        <FormattedMessage
          defaultMessage="Complete the course"
          id="learn.sequence.navigation.after.unit.completeCourse"
          description="The 'Complete the course' button in the unit nav"
        />
      );
    }
    // AA-198: Uncomment once there is a view for learners with failing grades
    // else if (isLastUnit && courseExitPageIsActive && !userHasPassingGrade) {
    //   buttonText = (
    //     <FormattedMessage
    //       defaultMessage="Next"
    //       id="learn.sequence.navigation.endOfCourse.button.next"
    //       description="The 'next' text in the end of course button in the sequence nav"
    //     />
    //     <FormattedMessage
    //       defaultMessage="(end of course)"
    //       id="learn.sequence.navigation.endOfCourse.button.endOfCourse"
    //       description="The '(end of course)' text in the end of course button in the sequence nav"
    //     />
    //   )
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
        <FormattedMessage
          id="learn.sequence.navigation.after.unit.previous"
          description="The button to go to the previous unit"
          defaultMessage="Previous"
        />
      </Button>
      {renderNextButton()}
    </div>
  );
}

UnitNavigation.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  onClickPrevious: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
};

UnitNavigation.defaultProps = {
  unitId: null,
};
