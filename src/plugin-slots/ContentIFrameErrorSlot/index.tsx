import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { ErrorPage } from '@edx/frontend-platform/react';

export const ContentIFrameErrorSlot : React.FC<Props> = ({ courseId }: Props) => (
  <PluginSlot
    id="org.openedx.frontend.learning.content_iframe_error.v1"
    pluginProps={{ courseId }}
  >
    <ErrorPage />
  </PluginSlot>
);

interface Props {
  courseId: string;
}
