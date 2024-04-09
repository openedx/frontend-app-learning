import UnitTranslationPlugin from '@edx/unit-translation-selector-plugin';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

import {
  OUTLINE_SIDEBAR_DESKTOP_PLUGIN_SLOT_ID,
  OUTLINE_SIDEBAR_MOBILE_PLUGIN_SLOT_ID,
} from '@src/courseware/course/sidebar/sidebars/course-outline';

// Load environment variables from .env file
const config = {
  ...process.env,
  pluginSlots: {
    unit_title_plugin: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'unit_title_plugin',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: UnitTranslationPlugin,
          },
        },
      ],
    },
    [OUTLINE_SIDEBAR_DESKTOP_PLUGIN_SLOT_ID]: {
      keepDefault: true,
      plugins: [],
    },
    [OUTLINE_SIDEBAR_MOBILE_PLUGIN_SLOT_ID]: {
      keepDefault: true,
      plugins: [],
    },
  },
};

export default config;
