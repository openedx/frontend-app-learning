# Progress Tab Related Links Slot

### Slot ID: `org.openedx.frontend.learning.progress_tab_related_links.v1`

### Slot ID Aliases
* `progress_tab_related_links_slot`

### Props:

## Description

This slot is used to replace or modify the related links view in the Progress Tab.

## Example

The following `env.config.jsx` will render the `course_id` of the course as a `<p>` element in a `<div>`.

![Screenshot of Content added after the Related Links Container](./images/progress_tab_related_links_slot.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { useContextId } from './src/data/hooks';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.progress_tab_related_links.v1': {
      plugins: [
        {
          // Insert custom content after related links widget
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_related_links_content',
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
