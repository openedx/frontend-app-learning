import UnitTranslationPlugin from '@plugins/UnitTranslationPlugin';
import { DIRECT_PLUGIN } from "@plugin-framework";

// Load environment variables from .env file
const config = {
  ...process.env,
  pluginSlots: {
    unit_title_plugin: {
      defaultContents: [
        {
          id: "default_widget",
          type: DIRECT_PLUGIN,
          priority: 1,
          RenderWidget: UnitTranslationPlugin,
        },
      ],
      plugins: [],
    },
  },
};

export default config;
