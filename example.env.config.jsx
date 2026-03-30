import UnitTranslationPlugin from '@edx/unit-translation-selector-plugin';
import { upgradeWidgetConfig } from './src/widgets/upgrade/src/index';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

// Load environment variables from .env file
const config = {
  ...process.env,
  SIDEBAR_WIDGETS: [upgradeWidgetConfig],

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
  },
};

export default config;
