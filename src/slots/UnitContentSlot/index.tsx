import { Slot } from '@openedx/frontend-base';
import type { ReactNode } from 'react';

import type { IFrameUrlParams } from '@src/courseware/course/sequence/Unit/urls';

export const unitContentSlotId = 'org.openedx.frontend.slot.learning.unitContent.v1';

export interface UnitContentSlotProps {
  courseId: string;
  sequenceId: string;
  unitId: string;
  title: string;
  elementId: string;
  iframeUrl: string;
  iframeUrlParams: IFrameUrlParams;
  loadingMessage: ReactNode;
  shouldShowContent: boolean;
  onLoaded?: () => void;
}

// The default content comes from the unit, which renders `ContentIFrame` with the same props.
const UnitContentSlot = ({
  courseId,
  sequenceId,
  unitId,
  title,
  elementId,
  iframeUrl,
  iframeUrlParams,
  loadingMessage,
  shouldShowContent,
  onLoaded,
  children,
}: UnitContentSlotProps & { children: ReactNode }) => (
  <Slot
    id={unitContentSlotId}
    courseId={courseId}
    sequenceId={sequenceId}
    unitId={unitId}
    title={title}
    elementId={elementId}
    iframeUrl={iframeUrl}
    iframeUrlParams={iframeUrlParams}
    loadingMessage={loadingMessage}
    shouldShowContent={shouldShowContent}
    onLoaded={onLoaded}
  >
    {children}
  </Slot>
);

export default UnitContentSlot;
