# Course Outline Sidebar Slot

### Slot ID: `course_outline_sidebar_slot`

## Description

This slot is used to replace/modify/hide the course outline sidebar.

## Example

### Default content
![Sidebar slot with default content](./screenshot_default.png)

### Replaced with custom component
![📊 in sidebar slot](./screenshot_custom.png)

The following `env.config.jsx` will replace the course outline sidebar entirely.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    course_outline_sidebar_slot: {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_sidebar_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1>📊</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
