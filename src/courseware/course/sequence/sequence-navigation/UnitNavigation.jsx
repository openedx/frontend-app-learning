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
    goToCourseCompletion,
  } = props;

  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const { courseId } = useSelector(state => state.courseware);
  const {
    courseCompletionIsActive,
    userHasPassingGrade,
  } = useModel('courses', courseId);

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
      {!courseCompletionIsActive && isLastUnit ? (
        <div className="m-2">
          <span role="img" aria-hidden="true">&#129303;</span> {/* This is a hugging face emoji */}
          {' '}
          <FormattedMessage
            id="learn.end.of.course"
            description="Message shown to students in place of a 'Next' button when they're at the end of a course."
            defaultMessage="You've reached the end of this course!"
          />
        </div>
      ) : (
        <Button
          variant="outline-primary"
          className="next-button"
          onClick={courseCompletionIsActive && isLastUnit && userHasPassingGrade ? goToCourseCompletion : onClickNext}
          disabled={courseCompletionIsActive && isLastUnit && !userHasPassingGrade}
        >
          {courseCompletionIsActive && isLastUnit ? (
            <FormattedMessage
              id="learn.sequence.navigation.after.unit.endOfCourse"
              description="The end of the course button in the unit nav"
              defaultMessage="Next (end of course)"
            />
          ) : (
            <FormattedMessage
              id="learn.sequence.navigation.after.unit.next"
              description="The button to go to the next unit"
              defaultMessage="Next"
            />
          )}
          <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
        </Button>
      )}
    </div>
  );
}

UnitNavigation.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  onClickPrevious: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  goToCourseCompletion: PropTypes.func.isRequired,
};

UnitNavigation.defaultProps = {
  unitId: null,
};
