# Notifications Discussions Sidebar Slot

### Slot ID: `org.openedx.frontend.learning.notifications_discussions_sidebar.v1`

### Slot ID Aliases
* `notifications_discussions_sidebar_slot`

## Description

This slot is used to replace/modify/hide the notifications discussions sidebar.

## Example

### Default content
![Sidebar slot with default content](./screenshot_default.png)

### Replaced with custom component
![📊 in sidebar slot](./screenshot_custom.png)

The following `env.config.jsx` will replace the notifications discussions sidebar.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.notifications_discussions_sidebar.v1': {
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
