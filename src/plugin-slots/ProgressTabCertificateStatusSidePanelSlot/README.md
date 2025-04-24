# Progress Tab Certificate Status Slot

### Slot ID: `org.openedx.frontend.learning.progress_tab_certificate_status_side_panel.v1`

### Slot ID Aliases
* `progress_tab_certificate_status_side_panel_slot`

### Props:

## Description

This slot is used to replace or modify the Certificate Status component in the
side panel of the Progress Tab.

## Example

The following `env.config.jsx` will render the `course_id` of the course as a `<p>` element in a `<div>`.

![Screenshot of Content added after the Certificate Status Container](./images/progress_tab_certificate_status_slot.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { useContextId } from './src/data/hooks';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.progress_tab_certificate_status_side_panel.v1': {
      plugins: [
        {
          // Insert custom content after certificate status
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_certificate_status_content',
            type: DIRECT_PLUGIN,
            RenderWidget: () => {
              const courseId = useContextId();
              return (
                <div>
                  <p>📚: {courseId}</p>
                </div>
              );
            },
          },
        },
      ]
    }
  },
}

export default config;
```
