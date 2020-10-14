import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';

import messages from './messages';

function SequenceNavigation({
  intl,
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
  goToCourseExitPage,
}) {
  const sequence = useModel('sequences', sequenceId);
  const { isFirstUnit, isLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const {
    courseId,
    sequenceStatus,
  } = useSelector(state => state.courseware);
  const isLocked = sequenceStatus === LOADED ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;
  const {
    courseExitPageIsActive,
    userHasPassingGrade,
  } = useModel('courses', courseId);

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} />
      );
    }
    if (sequence.unitIds.length === 0 || unitId === null) {
      return (
        <div style={{ flexBasis: '100%', minWidth: 0, borderBottom: 'solid 1px #EAEAEA' }} />
      );
    }
    return (
      <SequenceNavigationTabs
        unitIds={sequence.unitIds}
        unitId={unitId}
        showCompletion={sequence.showCompletion}
        onNavigate={onNavigate}
      />
    );
  };

  const renderNextButton = () => {
    // AA-198: The userHasPassingGrade condition can be removed once we have a view for learners with failing grades
    const buttonOnClick = (isLastUnit && courseExitPageIsActive && userHasPassingGrade
      ? goToCourseExitPage : nextSequenceHandler);
    // AA-198: The userHasPassingGrade condition can be removed once we have a view for learners with failing grades
    const disabled = isLastUnit && (!courseExitPageIsActive || !userHasPassingGrade);

    let buttonText = (intl.formatMessage(messages.nextButton));
    if (isLastUnit && courseExitPageIsActive && userHasPassingGrade) {
      buttonText = (intl.formatMessage(messages.completeCourseButton));
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
      <Button variant="link" className="next-btn" onClick={buttonOnClick} disabled={disabled}>
        {buttonText}
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    );
  };

  return sequenceStatus === LOADED && (
    <nav className={classNames('sequence-navigation', className)}>
      <Button variant="link" className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        {intl.formatMessage(messages.previousButton)}
      </Button>
      {renderUnitButtons()}
      {renderNextButton()}
    </nav>
  );
}

SequenceNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};

export default injectIntl(SequenceNavigation);
