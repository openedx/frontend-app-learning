import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import LockPaywall from '../../courseware/course/sequence/lock-paywall';

export const GatedUnitContentMessageSlot = ({
  courseId,
} : GatedUnitContentMessageSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.gated_unit_content_message.v1"
    idAliases={['gated_unit_content_message_slot']}
    pluginProps={{
      courseId,
    }}
  >
    <LockPaywall courseId={courseId} />
  </PluginSlot>
);

interface GatedUnitContentMessageSlotProps {
  courseId: string;
}
