import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import UnitButton from './UnitButton';

export default function SequenceNavigation({
  onNext,
  onPrevious,
  onNavigate,
  unitIds,
  isLocked,
  showCompletion,
  activeUnitId,
  className,
}) {
  const unitButtons = unitIds.map(unitId => (
    <UnitButton
      key={unitId}
      unitId={unitId}
      isActive={activeUnitId === unitId}
      showCompletion={showCompletion}
      onClick={onNavigate}
    />
  ));

  return (
    <nav className={classNames('sequence-navigation', className)}>
      <Button className="previous-btn" onClick={onPrevious}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        <FormattedMessage
          defaultMessage="Previous"
          id="learn.sequence.navigation.previous.button"
          description="The Previous button in the sequence nav"
        />
      </Button>

      {isLocked ? <UnitButton type="lock" isActive /> : unitButtons}

      <Button className="next-btn" onClick={onNext}>
        <FormattedMessage
          defaultMessage="Next"
          id="learn.sequence.navigation.next.button"
          description="The Next button in the sequence nav"
        />
        <FontAwesomeIcon icon={faChevronRight} className="ml-2" size="sm" />
      </Button>
    </nav>
  );
}

SequenceNavigation.propTypes = {
  className: PropTypes.string,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  isLocked: PropTypes.bool.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeUnitId: PropTypes.string.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
};
