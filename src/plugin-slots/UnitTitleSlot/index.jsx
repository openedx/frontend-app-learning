import PropTypes from 'prop-types';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';

import { BookmarkButton } from '@src/courseware/course/bookmark';
import messages from '@src/courseware/course/sequence/messages';

const UnitTitleSlot = ({
  unitId,
  unit,
  isEnabledOutlineSidebar,
  renderUnitNavigation,
}) => {
  const { formatMessage } = useIntl();
  const isProcessing = unit.bookmarkedUpdateState === 'loading';
  // Calculate the estimated hours and minutes for the unit based on the estimated time
  const estimatedMinutes = (unit.estimatedTimeMinutes || 0) % 60;

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.unit_title.v1"
      idAliases={['unit_title_slot']}
      pluginProps={{
        unitId,
        unit,
        isEnabledOutlineSidebar,
        renderUnitNavigation,
      }}
    >
      <div className="d-flex justify-content-between">
        <div className="mb-0">
          <h3 className="h3">{unit.title}</h3>
          {/* Display the estimated time for the unit below the title if showEstimatedTime is true and estimatedTimeMinutes > 0 */}
          {unit.showEstimatedTime && unit.estimatedTimeMinutes > 0 && (
            <p className="small text-primary-500 mb-2">
              {unit.estimatedTimeMinutes >= 60 ? (
                <>
                  Estimated Time to Complete:{' '}
                  <em>
                    {estimatedHours} hour{estimatedHours !== 1 ? 's' : ''} and {estimatedMinutes} minute{estimatedMinutes !== 1 ? 's' : ''}
                  </em>
                </>
              ) : (
                <>
                  Estimated Time to Complete: <em>{unit.estimatedTimeMinutes} minute{unit.estimatedTimeMinutes !== 1 ? 's' : ''}</em>
                </>
              )}
            </p>
          )}
        </div>
        {isEnabledOutlineSidebar && renderUnitNavigation(true)}
      </div>
      <p className="sr-only">{formatMessage(messages.headerPlaceholder)}</p>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={isProcessing}
      />
    </PluginSlot>
  );
};

UnitTitleSlot.propTypes = {
  unitId: PropTypes.string.isRequired,
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    bookmarked: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    bookmarkedUpdateState: PropTypes.string.isRequired,
    // Added estimatedTimeMinutes and showEstimatedTime to the unit prop types for the estimated time display in the UnitTitleSlot
    estimatedTimeMinutes: PropTypes.number,
    showEstimatedTime: PropTypes.bool,
  }).isRequired,
  isEnabledOutlineSidebar: PropTypes.bool.isRequired,
  renderUnitNavigation: PropTypes.func.isRequired,
};

export default UnitTitleSlot;
