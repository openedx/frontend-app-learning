import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

const UnitContentsSlot = ({ courseId, unitId, children }) => (
  <PluginSlot
    id="org.openedx.frontend.learning.unit_contents.v1"
    pluginProps={{ courseId, unitId }}
  >
    {children}
  </PluginSlot>
);

UnitContentsSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default UnitContentsSlot;
