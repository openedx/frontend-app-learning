# Course Breadcrumbs Slot

### Slot ID: `course_breadcrumbs_slot`

## Description

This slot is used to replace/modify/hide the course breadcrumbs.

## Example

### Default content
![Breadcrumbs slot with default content](./screenshot_default.png)

### Replaced with custom component
![🍞 in breadcrumbs slot](./screenshot_custom.png)

The following `env.config.jsx` will replace the course breadcrumbs entirely.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    course_breadcrumbs_slot: {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_breadcrumbs_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1>🍞</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
