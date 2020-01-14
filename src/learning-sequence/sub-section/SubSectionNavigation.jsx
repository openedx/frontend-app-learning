import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { history } from '@edx/frontend-platform';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faBook, faPencilAlt, faTasks, faLock } from '@fortawesome/free-solid-svg-icons';

import { usePreviousUnit, useNextUnit, useCurrentSequenceUnits, useCurrentUnit } from '../data/hooks';
import CourseStructureContext from '../CourseStructureContext';
import SequenceMetadataContext from './SequenceMetadataContext';

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
    case 'lock':
      icon = faLock;
      break;
    default:
      icon = faBook;
  }

  return (
    <FontAwesomeIcon icon={icon} />
  );
}

UnitIcon.propTypes = {
  type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem', 'lock']).isRequired,
};

export default function SequenceNavigation() {
  const { courseUsageKey, unitId } = useContext(CourseStructureContext);
  const previousUnit = usePreviousUnit();
  const nextUnit = useNextUnit();

  const handlePreviousClick = useCallback(() => {
    if (previousUnit) {
      history.push(`/course/${courseUsageKey}/${previousUnit.parentId}/${previousUnit.id}`);
    }
  });
  const handleNextClick = useCallback(() => {
    if (nextUnit) {
      history.push(`/course/${courseUsageKey}/${nextUnit.parentId}/${nextUnit.id}`);
    }
  });

  const handleUnitClick = useCallback((unit) => {
    history.push(`/course/${courseUsageKey}/${unit.parentId}/${unit.id}`);
  });

  if (!unitId) {
    return null;
  }

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
  const currentUnit = useCurrentUnit();
  const units = useCurrentSequenceUnits();
  const metadata = useContext(SequenceMetadataContext);

  const isGated = metadata.gatedContent.gated;

  return (
    <div className="btn-group ml-2 mr-2 flex-grow-1 d-flex" role="group">
      {!isGated && units.map(unit => (
        <UnitButton key={unit.id} unit={unit} disabled={unit.id === currentUnit.id} clickHandler={clickHandler} />
      ))}
      {isGated && <UnitButton key={currentUnit.id} unit={currentUnit} disabled locked />}
    </div>
  );
}

UnitNavigation.propTypes = {
  clickHandler: PropTypes.func.isRequired,
};

function UnitButton({
  unit, disabled, locked, clickHandler,
}) {
  const { id, type } = unit;
  const handleClick = useCallback(() => {
    if (clickHandler !== null) {
      clickHandler(unit);
    }
  }, [unit]);

  return (
    <Button
      key={id}
      className="btn-outline-secondary unit-button flex-grow-1"
      onClick={handleClick}
      disabled={disabled}
    >
      <UnitIcon type={locked ? 'lock' : type} />
    </Button>
  );
}

UnitButton.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem']).isRequired,
  }).isRequired,
  disabled: PropTypes.bool.isRequired, // Whether or not the button will function.
  locked: PropTypes.bool, // Whether the unit is semantically "locked" and unnavigable.
  clickHandler: PropTypes.func,
};

UnitButton.defaultProps = {
  clickHandler: null,
  locked: false,
};
