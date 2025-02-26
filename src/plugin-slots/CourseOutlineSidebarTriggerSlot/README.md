# Course Outline Sidebar Trigger Slot

### Slot ID: `course_outline_sidebar_trigger_slot`
### Props:
* `sectionId`
* `sequenceId`
* `unitId`
* `isStaff`

## Description

This slot is used to replace/modify/hide the course outline sidebar trigger.

## Example

### Default content
![Trigger slot with default content](./screenshot_default.png)

### Replaced with custom component
![📌 in trigger slot](./screenshot_custom.png)

The following `env.config.jsx` will replace the course outline sidebar trigger entirely.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    course_outline_sidebar_trigger_slot: {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_sidebar_trigger_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1 className="d-none d-xl-block">📌</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
