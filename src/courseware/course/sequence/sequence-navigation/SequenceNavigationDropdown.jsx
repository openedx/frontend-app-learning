import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import UnitButton from './UnitButton';

export default function SequenceNavigationDropdown({
  unitId,
  onNavigate,
  showCompletion,
  unitIds,
}) {
  return (
    <Dropdown className="sequence-navigation-dropdown">
      <Dropdown.Toggle variant="link" className="font-weight-normal w-100 border-right-0">
        <FormattedMessage
          defaultMessage="{current} of {total}"
          description="The title of the mobile menu for sequence navigation of units"
          id="learn.course.sequence.navigation.mobile.menu"
          values={{
            current: unitIds.indexOf(unitId) + 1,
            total: unitIds.length,
          }}
        />
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-100">
        {unitIds.map(buttonUnitId => (
          <Dropdown.Item
            as={UnitButton}
            className="w-100"
            isActive={unitId === buttonUnitId}
            key={buttonUnitId}
            onClick={onNavigate}
            showCompletion={showCompletion}
            showTitle
            unitId={buttonUnitId}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

SequenceNavigationDropdown.propTypes = {
  unitId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  showCompletion: PropTypes.bool.isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
