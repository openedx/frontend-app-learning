import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';

export default function SequenceNavigation({
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
  goToCourseCompletion,
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
    courseCompletionIsActive,
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

  return sequenceStatus === LOADED && (
    <nav className={classNames('sequence-navigation', className)}>
      <Button variant="link" className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        <FormattedMessage
          defaultMessage="Previous"
          id="learn.sequence.navigation.previous.button"
          description="The Previous button in the sequence nav"
        />
      </Button>
      {renderUnitButtons()}
      <Button
        variant="link"
        className="next-btn"
        onClick={
          courseCompletionIsActive && userHasPassingGrade && isLastUnit ? goToCourseCompletion : nextSequenceHandler
        }
        disabled={isLastUnit && (!courseCompletionIsActive || !userHasPassingGrade)}
      >
        {courseCompletionIsActive && isLastUnit ? (
          <div>
            <div>
              <FormattedMessage
                defaultMessage="Next"
                id="learn.sequence.navigation.endOfCourse.button.next"
                description="The 'next' text in the end of course button in the sequence nav"
              />
            </div>
            <div>
              <FormattedMessage
                defaultMessage="(end of course)"
                id="learn.sequence.navigation.endOfCourse.button.endOfCourse"
                description="The '(end of course)' text in the end of course button in the sequence nav"
              />
            </div>
          </div>
        ) : (
          <FormattedMessage
            defaultMessage="Next"
            id="learn.sequence.navigation.next.button"
            description="The Next button in the sequence nav"
          />
        )}
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    </nav>
  );
}

SequenceNavigation.propTypes = {
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  goToCourseCompletion: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};
