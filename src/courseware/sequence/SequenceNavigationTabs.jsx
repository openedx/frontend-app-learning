import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import UnitButton from './UnitButton';
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
        <Dropdown className="sequence-navigation-dropdown">
          <Dropdown.Button className="dropdown-button font-weight-normal w-100 border-right-0">
            <FormattedMessage
              id="learn.course.sequence.navigation.mobile.menu"
              description="The title of the mobile menu for sequence navigation of units"
              defaultMessage="{current} of {total}"
              values={{
                current: unitIds.indexOf(activeUnitId) + 1,
                total: unitIds.length,
              }}
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
                showTitle
              />
            ))}

          </Dropdown.Menu>
        </Dropdown>
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
