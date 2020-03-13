import React from 'react';
import PropTypes from 'prop-types';

import UnitButton from './UnitButton';
import SequenceNavigationDropdown from './SequenceNavigationDropdown';
import useIndexOfLastVisibleChild from '../../tabs/useIndexOfLastVisibleChild';

const invisibleStyle = {
  position: 'absolute',
  left: 0,
  pointerEvents: 'none',
  visibility: 'hidden',
};

export default function SequenceNavigationTabs({
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
          className="sequence-navigation-tabs d-flex flex-grow-1"
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
        <SequenceNavigationDropdown
          activeUnitId={activeUnitId}
          onNavigate={onNavigate}
          showCompletion={showCompletion}
          unitIds={unitIds}
        />
      )}
    </div>
  );
}

SequenceNavigationTabs.propTypes = {
  activeUnitId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
