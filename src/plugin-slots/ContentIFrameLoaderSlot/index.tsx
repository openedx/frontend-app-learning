import React, { ReactNode } from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import PageLoading from '../../generic/PageLoading';

export const ContentIFrameLoaderSlot = ({
  courseId,
  loadingMessage,
} : ContentIFrameLoaderSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.content_iframe_loader.v1"
    idAliases={['content_iframe_loader_slot']}
    pluginProps={{
      defaultLoaderComponent: <PageLoading srMessage={loadingMessage} />,
      courseId,
    }}
  >
    <PageLoading srMessage={loadingMessage} />
  </PluginSlot>
);

interface ContentIFrameLoaderSlotProps {
  courseId: string;
  loadingMessage: ReactNode;
}
