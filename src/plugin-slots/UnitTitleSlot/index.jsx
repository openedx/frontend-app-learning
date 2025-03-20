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
  
  return (
    <PluginSlot
      id="unit_title_slot"
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
  courseId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  unitTitle: PropTypes.string.isRequired,
};

export default UnitTitleSlot;
