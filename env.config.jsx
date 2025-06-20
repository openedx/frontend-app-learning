import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.layout.footer_lang_selector.v1': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Modify,
          widgetId: 'default_contents',
          fn: (widget) => ({ ...widget, content: { supportedLanguages: ['ar', 'es-419', 'en', 'ru']}})
        },
      ]
    }
  },
}

export default config;
