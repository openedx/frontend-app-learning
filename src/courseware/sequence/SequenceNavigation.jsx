import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from '@edx/paragon';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import UnitButton from './UnitButton';
import useIndexOfLastVisibleChild from '../../tabs/useIndexOfLastVisibleChild';

const invisibleStyle = {
  position: 'absolute',
  left: 0,
  pointerEvents: 'none',
  visibility: 'hidden',
};

function SequenceNavigationTabs({
  unitIds, activeUnitId, showCompletion, onNavigate,
}) {
  const [
    indexOfLastVisibleChild,
    containerRef,
  ] = useIndexOfLastVisibleChild();
  const shouldDisplayDropdown = indexOfLastVisibleChild === -1;

  return (
    <div style={{ flexBasis: '100%', minWidth: 0 }}>
      <div className="sequence-navigation-tabs-container" ref={containerRef}>
        <div
          className="sequence-navigation-tabs"
          style={shouldDisplayDropdown ? invisibleStyle : null}
        >
          {unitIds.map(unitId => (
            <UnitButton
              key={unitId}
              unitId={unitId}
              isActive={activeUnitId === unitId}
              showCompletion={showCompletion}
              onClick={onNavigate}
            />
          ))}

        </div>
      </div>
      {shouldDisplayDropdown && (
        <Dropdown>
          <Dropdown.Button className="dropdown-button font-weight-normal w-100 border-right-0">
            <FormattedMessage
              id="learn.course.tabs.navigation.overflow.menu"
              description="The title of the overflow menu for course tabs"
              defaultMessage="More..."
            />
          </Dropdown.Button>
          <Dropdown.Menu className="w-100">

            {unitIds.map(unitId => (
              <UnitButton
                className="w-100"
                key={unitId}
                unitId={unitId}
                isActive={activeUnitId === unitId}
                showCompletion={showCompletion}
                onClick={onNavigate}
              />
            ))}

          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}

export default function SequenceNavigation({
  activeUnitId,
  className,
  isFirstUnit,
  isLastUnit,
  isLocked,
  onNavigate,
  onNext,
  onPrevious,
  showCompletion,
  unitIds,
}) {
  return (
    <nav className={classNames('sequence-navigation', className)}>
      <Button className="previous-btn" onClick={onPrevious} disabled={isFirstUnit}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-2" size="sm" />
        <FormattedMessage
          defaultMessage="Previous"
          id="learn.sequence.navigation.previous.button"
          description="The Previous button in the sequence nav"
        />
      </Button>


      {isLocked ? <UnitButton type="lock" isActive /> : (
        <SequenceNavigationTabs
          unitIds={unitIds}
          activeUnitId={activeUnitId}
          showCompletion={showCompletion}
          onNavigate={onNavigate}
        />
      )}

      <Button className="next-btn" onClick={onNext} disabled={isLastUnit}>
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
  activeUnitId: PropTypes.string.isRequired,
  className: PropTypes.string,
  isFirstUnit: PropTypes.bool.isRequired,
  isLastUnit: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
};
