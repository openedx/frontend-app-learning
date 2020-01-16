import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import UnitButton from './UnitButton';

export default function SequenceNavigation({
  onNext,
  onPrevious,
  onNavigate,
  units,
  isLocked,
  showCompletion,
}) {
  const unitButtons = units.map((unit, index) => (
    <UnitButton
      key={unit.id}
      {...unit}
      isComplete={showCompletion && unit.complete}
      onClick={onNavigate.bind(null, index)}
    />
  ));

  return (
    <nav className="flex-grow-0 d-flex w-100 btn-group">
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
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    complete: PropTypes.bool.isRequired,
  })).isRequired,
  isLocked: PropTypes.bool.isRequired,
  showCompletion: PropTypes.bool.isRequired,
};
