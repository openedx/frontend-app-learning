import React from 'react';
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
    <nav className="flex-grow-0 d-flex w-100 mb-3 btn-group">
      <Button className="btn-outline-primary" onClick={onPrevious}>
        Previous
      </Button>

      {isLocked ? <UnitButton type="lock" isActive={true} /> : unitButtons}

      <Button className="btn-outline-primary" onClick={onNext}>
        Next
      </Button>
    </nav>
  );
}
