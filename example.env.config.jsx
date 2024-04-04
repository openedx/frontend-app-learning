import UnitTranslationPlugin from '@plugins/UnitTranslationPlugin';
import { Trigger as CourseOutlineSidebarTrigger } from '@plugins/CourseOutlineSidebar';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';

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
    sequence_container_plugin: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'COURSE_OUTLINE_SIDEBAR',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: CourseOutlineSidebarTrigger,
          },
        },
      ],
    },
    course_content_triggers_plugin: {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'COURSE_OUTLINE_SIDEBAR',
            type: DIRECT_PLUGIN,
            priority: 1,
            RenderWidget: CourseOutlineSidebarTrigger,
          },
        },
      ],
    },
  },
};

export default config;
