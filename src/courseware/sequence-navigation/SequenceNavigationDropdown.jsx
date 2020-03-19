import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import UnitButton from './UnitButton';

export default function SequenceNavigationDropdown({
  activeUnitId,
  onNavigate,
  showCompletion,
  unitIds,
}) {
  return (
    <Dropdown className="sequence-navigation-dropdown">
      <Dropdown.Button className="dropdown-button font-weight-normal w-100 border-right-0">
        <FormattedMessage
          defaultMessage="{current} of {total}"
          description="The title of the mobile menu for sequence navigation of units"
          id="learn.course.sequence.navigation.mobile.menu"
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
            isActive={activeUnitId === unitId}
            key={unitId}
            onClick={onNavigate}
            showCompletion={showCompletion}
            showTitle
            unitId={unitId}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

SequenceNavigationDropdown.propTypes = {
  activeUnitId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
