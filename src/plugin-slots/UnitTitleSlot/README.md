# Unit Title Slot

### Slot ID: `org.openedx.frontend.learning.unit_title.v2`

### Slot ID Aliases
* `unit_title_slot`

### Props:
* `unitId`
* `unit`
* `renderUnitNavigation`

## Description

This slot is used for adding content before or after the Unit title.
`isEnabledOutlineSidebar` is no longer used in the default implementation,  
but is still passed as a plugin prop with a default value of `true` for backward compatibility.

## Example

The following `env.config.jsx` will render `unit_id` and `unitTitle` of the course as `<p>` elements.

![Screenshot of Content added before and after the Unit Title](./images/screenshot_custom.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.unit_title.v2': {
      plugins: [
        {
          // Insert custom content after unit title
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_unit_title_content',
            type: DIRECT_PLUGIN,
            RenderWidget: ({ unitId, unit, renderUnitNavigation }) => (
              <>
                {renderUnitNavigation(true)}
                <p>📙: {unit.title}</p>
                <p>📙: {unitId}</p>
              </>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```

## Version Notes

- `v2`: Removed default slot content. `isEnabledOutlineSidebar` is no longer used internally,  
  but still passed as a plugin prop (`true`) to maintain compatibility.
