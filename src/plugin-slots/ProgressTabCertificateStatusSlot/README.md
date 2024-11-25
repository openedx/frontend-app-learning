# Progress Tab Certificate Status Slot

### Slot ID: `progress_tab_certificate_status_slot`
### Props:
* `courseId`

## Description

This slot is used to replace or modify the Certificate Status component in the
Progress Tab.

## Example

The following `env.config.jsx` will render the `course_id` of the course as a `<p>` element in a `<div>`.

![Screenshot of Content added after the Certificate Status Container](./images/progress_tab_certificate_status_slot.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    progress_tab_certificate_status_slot: {
      plugins: [
        {
          // Insert custom content after certificate status
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_certificate_status_content',
            type: DIRECT_PLUGIN,
            RenderWidget: () => {
              const { courseId } = useSelector(state => state.courseHome);
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
