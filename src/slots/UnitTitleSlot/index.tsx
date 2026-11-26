import { Slot, useIntl } from '@openedx/frontend-base';
import type { ReactNode } from 'react';

import { BookmarkButton } from '@src/courseware/course/bookmark';
import messages from '@src/courseware/course/sequence/messages';
import type { SequenceUnit } from '@src/courseware/data/sequenceMetadata';

export const unitTitleSlotId = 'org.openedx.frontend.slot.learning.unitTitle.v1';

export interface UnitTitleSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string;
  unit: SequenceUnit;
  renderUnitNavigation: (isAtTop: boolean) => ReactNode;
}

const UnitTitleSlot = ({
  courseId, sequenceId, unitId, unit, renderUnitNavigation,
}: UnitTitleSlotProps) => {
  const { formatMessage } = useIntl();
  const isProcessing = unit.bookmarkedUpdateState === 'loading';

  return (
    <Slot
      id={unitTitleSlotId}
      courseId={courseId}
      sequenceId={sequenceId}
      unitId={unitId}
      unit={unit}
      renderUnitNavigation={renderUnitNavigation}
    >
      <div className="d-flex justify-content-between">
        <div className="mb-0">
          <h3 className="h3">{unit.title}</h3>
        </div>
        {renderUnitNavigation(true)}
      </div>
      <p className="sr-only">{formatMessage(messages.headerPlaceholder)}</p>
      <BookmarkButton
        sequenceId={unit.sequenceId}
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={isProcessing}
      />
    </Slot>
  );
};

export default UnitTitleSlot;
