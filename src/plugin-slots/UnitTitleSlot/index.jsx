import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const UnitTitleSlot = ({ courseId, unitId, unitTitle }) => (
  <PluginSlot
    id="unit_title_slot"
    pluginProps={{
      courseId,
      unitId,
      unitTitle,
    }}
  />
);

UnitTitleSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  unitTitle: PropTypes.string.isRequired,
};

export default UnitTitleSlot;
