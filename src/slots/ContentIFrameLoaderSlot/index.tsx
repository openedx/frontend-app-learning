import { Slot } from '@openedx/frontend-base';
import type { ReactNode } from 'react';

import PageLoading from '@src/generic/PageLoading';

export const contentIFrameLoaderSlotId = 'org.openedx.frontend.slot.learning.contentIFrameLoader.v1';

export interface ContentIFrameLoaderSlotProps {
  courseId: string;
  unitId: string;
  loadingMessage: ReactNode;
}

const ContentIFrameLoaderSlot = ({ courseId, unitId, loadingMessage }: ContentIFrameLoaderSlotProps) => (
  <Slot id={contentIFrameLoaderSlotId} courseId={courseId} unitId={unitId} loadingMessage={loadingMessage}>
    <PageLoading srMessage={loadingMessage} />
  </Slot>
);

export default ContentIFrameLoaderSlot;
