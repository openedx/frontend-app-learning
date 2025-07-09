import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import ProctoringInfoPanel from '../../course-home/outline-tab/widgets/ProctoringInfoPanel';

export const ProctoringInfoPanelSlot = (
  { proctoringReviewRequirementsButtonLink }:ProctoringInfoPanelSlotProps,
) => (
  <PluginSlot
    id="org.openedx.frontend.learning.proctoring_info_panel.v1"
    idAliases={['proctoring_info_panel_slot']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <ProctoringInfoPanel
      proctoringReviewRequirementsButtonLink={proctoringReviewRequirementsButtonLink ?? ''}
    />
  </PluginSlot>
);

interface ProctoringInfoPanelSlotProps {
  proctoringReviewRequirementsButtonLink?: string;
}
