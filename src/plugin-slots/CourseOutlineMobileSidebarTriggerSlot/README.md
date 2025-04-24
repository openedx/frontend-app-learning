# Course Outline Mobile Sidebar Trigger Slot

### Slot ID: `org.openedx.frontend.learning.course_outline_mobile_sidebar_trigger.v1`

### Slot ID Aliases
* `course_outline_mobile_sidebar_trigger_slot`

## Description

This slot is used to replace/modify/hide the course outline sidebar mobile trigger.

## Example

### Default content
![Trigger slot with default content](./screenshot_default.png)

### Replaced with custom component
![📌 in trigger slot](./screenshot_custom.png)

The following `env.config.jsx` will replace the course outline sidebar mobile trigger entirely.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.course_outline_mobile_sidebar_trigger.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_sidebar_trigger_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1 className="d-xl-none">📌</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
