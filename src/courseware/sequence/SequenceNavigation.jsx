import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import classNames from 'classnames';

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
    <nav className={classNames('flex-grow-0 d-flex w-100 btn-group', className)}>
      <Button className="btn-outline-primary" onClick={onPrevious}>
        Previous
      </Button>

      {isLocked ? <UnitButton type="lock" isActive /> : unitButtons}

      <Button className="btn-outline-primary" onClick={onNext}>
        Next
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
