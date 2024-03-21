import UnitTranslationPlugin from '@plugins/UnitTranslationPlugin';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

// Load environment variables from .env file
const config = {
  ...process.env,
  pluginSlots: {
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
};

export default config;
