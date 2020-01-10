import React, { useCallback, useContext } from 'react';
import { history } from '@edx/frontend-platform';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faBook, faPencilAlt, faTasks } from '@fortawesome/free-solid-svg-icons';

import { useCurrentSubSection, usePreviousUnit, useNextUnit, useCurrentSubSectionUnits } from '../data/hooks';
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
  const subSection = useCurrentSubSection();
  const previousUnit = usePreviousUnit();
  const nextUnit = useNextUnit();

  const handlePreviousClick = useCallback(() => {
    if (previousUnit) {
      history.push(`/course/${courseId}/${subSection.id}/${previousUnit.id}`);
    }
  });
  const handleNextClick = useCallback(() => {
    if (nextUnit) {
      history.push(`/course/${courseId}/${subSection.id}/${nextUnit.id}`);
    }
  });

  return (
    <nav>
      <Button
        key="previous"
        className="btn-outline-primary"
        onClick={handlePreviousClick}
      >
        Previous
      </Button>
      {/* {this.renderUnits()} */}
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

function UnitNavigation() {
  const units = useCurrentSubSectionUnits();
}

function renderUnits() {
  return this.props.unitIds.map((id) => {
    const { type } = this.props.units[id];
    const disabled = this.props.activeUnitId === id;
    return (
      <Button
        key={id}
        className="btn-outline-secondary unit-button"
        onClick={() => this.props.unitClickHandler(id)}
        disabled={disabled}
      >
        {this.renderUnitIcon(type)}
      </Button>
    );
  });
}


SubSectionNavigation.propTypes = {
  // unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // units: PropTypes.objectOf(PropTypes.shape({
  //   pageTitle: PropTypes.string.isRequired,
  //   type: PropTypes.oneOf(['video', 'other', 'vertical', 'problem']).isRequired,
  // })).isRequired,
  // activeUnitId: PropTypes.string.isRequired,
  // unitClickHandler: PropTypes.func.isRequired,
  // nextClickHandler: PropTypes.func.isRequired,
  // previousClickHandler: PropTypes.func.isRequired,
};
