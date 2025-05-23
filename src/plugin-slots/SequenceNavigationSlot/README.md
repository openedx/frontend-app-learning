# Sequence Navigation Slot

### Slot ID: `org.openedx.frontend.learning.sequence_navigation.v1`

### Slot ID Aliases
* `sequence_navigation_slot`

### Props:
* `sequenceId`
* `unitId`
* `nextHandler`
* `onNavigate`
* `previousHandler`

## Description

This slot is used to replace/modify/hide the sequence navigation.

## Example

### Default content
![Sequence navigation slot with default content](./screenshot_default.png)

### Replaced with custom component
![📖 in sequence navigation slot](./screenshot_custom.png)

The following `env.config.jsx` will replace the sequence navigation entirely.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.sequence_navigation.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_sequence_navigation',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1 className="bg-gray-100 text-center">📖</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
