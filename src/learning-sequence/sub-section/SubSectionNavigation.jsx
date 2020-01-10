import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { history } from '@edx/frontend-platform';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faBook, faPencilAlt, faTasks } from '@fortawesome/free-solid-svg-icons';

import { useCurrentSubSection, usePreviousUnit, useNextUnit, useCurrentSubSectionUnits, useCurrentUnit } from '../data/hooks';
import CourseStructureContext from '../CourseStructureContext';

function UnitIcon({ type }) {
  let icon = null;
  switch (type) {
    case 'video':
      icon = faFilm;
      break;
    case 'other':
      icon = faBook;
      break;
    case 'vertical':
      icon = faTasks;
      break;
    case 'problem':
      icon = faPencilAlt;
      break;
    default:
      icon = faBook;
  }

  return (
    <FontAwesomeIcon icon={icon} />
  );
}

export default function SubSectionNavigation() {
  const { courseId } = useContext(CourseStructureContext);
  const previousUnit = usePreviousUnit();
  const nextUnit = useNextUnit();

  const handlePreviousClick = useCallback(() => {
    if (previousUnit) {
      history.push(`/course/${courseId}/${previousUnit.parentId}/${previousUnit.id}`);
    }
  });
  const handleNextClick = useCallback(() => {
    if (nextUnit) {
      history.push(`/course/${courseId}/${nextUnit.parentId}/${nextUnit.id}`);
    }
  });

  const handleUnitClick = useCallback((unit) => {
    history.push(`/course/${courseId}/${unit.parentId}/${unit.id}`);
  });

  return (
    <nav className="flex-grow-0 d-flex w-100 mb-3">
      <Button
        key="previous"
        className="btn-outline-primary"
        onClick={handlePreviousClick}
      >
        Previous
      </Button>
      <UnitNavigation clickHandler={handleUnitClick} />
      <Button
        key="next"
        className="btn-outline-primary"
        onClick={handleNextClick}
      >
        Next
      </Button>
    </nav>
  );
}

function UnitNavigation({ clickHandler }) {
  const units = useCurrentSubSectionUnits();
  const currentUnit = useCurrentUnit();

  return (
    <div className="btn-group ml-2 mr-2 flex-grow-1 d-flex" role="group">
      {units.map(unit => (
        <UnitButton key={unit.id} unit={unit} disabled={unit.id === currentUnit.id} clickHandler={clickHandler} />
      ))}
    </div>
  );
}

UnitNavigation.propTypes = {
  clickHandler: PropTypes.func.isRequired,
};

function UnitButton({ unit, disabled, clickHandler }) {
  const { id, type } = unit;
  const handleClick = useCallback(() => {
    clickHandler(unit);
  }, [unit]);

  return (
    <Button
      key={id}
      className="btn-outline-secondary unit-button flex-grow-1"
      onClick={handleClick}
      disabled={disabled}
    >
      <UnitIcon type={type} />
    </Button>
  );
}

UnitButton.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem']).isRequired,
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  clickHandler: PropTypes.func.isRequired,
};
