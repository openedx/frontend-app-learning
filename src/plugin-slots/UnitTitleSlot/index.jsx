import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const UnitTitleSlot = ({ courseId, unitId }) => (
  <PluginSlot
    id="unit_title_slot"
    pluginProps={{
      courseId,
      unitId,
    }}
  />
);

UnitTitleSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default UnitTitleSlot;
