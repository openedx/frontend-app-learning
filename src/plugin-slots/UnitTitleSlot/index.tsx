import React from 'react';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { useIntl } from '@edx/frontend-platform/i18n';

import { BookmarkButton } from '@src/courseware/course/bookmark';
import messages from '@src/courseware/course/sequence/messages';

interface Props {
  unitId: string;
  unit: {
    id: string;
    bookmarked: boolean;
    title: string;
    bookmarkedUpdateState?: string;
  };
  renderUnitNavigation: (isAtTop: boolean) => React.ReactNode;
}

const UnitTitleSlot = ({
  unitId,
  unit,
  renderUnitNavigation,
}: Props) => {
  const { formatMessage } = useIntl();
  const isProcessing = unit.bookmarkedUpdateState === 'loading';

  return (
    <PluginSlot
      id="org.openedx.frontend.learning.unit_title.v1"
      idAliases={['unit_title_slot']}
      pluginProps={{
        unitId,
        unit,
        isEnabledOutlineSidebar: true,
        renderUnitNavigation,
      }}
    >
      <div className="d-flex justify-content-between">
        <div className="mb-0">
          <h3 className="h3">{unit.title}</h3>
        </div>
        {renderUnitNavigation(true)}
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

export default UnitTitleSlot;
