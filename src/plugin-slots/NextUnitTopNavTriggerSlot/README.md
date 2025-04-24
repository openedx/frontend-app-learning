# Next Unit Top Navigation Trigger Slot

### Slot ID: `org.openedx.frontend.learning.next_unit_top_nav_trigger.v1`

### Slot ID Aliases
* `next_unit_top_nav_trigger_slot`

## Description

This slot is used to replace/modify/hide the next button used for unit and sequence navigation at the top of the unit page.

## Example

### Default content

**Next unit button in at top for left sidebar navigation**
![Screenshot of next unit button slot at the top for left sidebar navigation with default content](./screenshot_unit_at_top_default.png)

**Next unit button in horizontal navigation**
![Screenshot of horizontal navigaton next unit button slot with default content](./screenshot_horizontal_nav_default.png)

### Replaced with custom component

**Next unit button in at top for left sidebar navigation**
![Screenshot of 📊 in next unit slot at the top for left sidebar navigation](./screenshot_unit_at_top_custom.png)

**Next unit button in horizontal navigation**
![Screenshot of 📊 in next unit slot for horizontal navigaton](./screenshot_horizontal_nav_default.png)
![📊 in next unit slot](./screenshot_horizontal_nav_custom.png)

The following `env.config.jsx` will replace the next unit/sequence button at the top of the unit page. This can be used control the
button's `onClick` atrribute or change the name of the button.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.next_unit_top_nav_trigger.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_button_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <button>📊</button>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
