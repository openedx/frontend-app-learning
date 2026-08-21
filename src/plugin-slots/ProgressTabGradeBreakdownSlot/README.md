# Progress Tab Grade Breakdown Slot

### Slot ID: `org.openedx.frontend.learning.progress_tab_grade_breakdown.v1`

### Slot ID Aliases
* `progress_tab_grade_breakdown_slot`

### Props:

## Description

This slot is used to replace or modify the Grade Summary and Details Breakdown view in the Progress Tab.

## Example

The following `env.config.jsx` will render the `course_id` of the course as a `<p>` element in a `<div>`.

![Screenshot of Content added after the Grade Summary and Details Container](./images/progress_tab_grade_breakdown_slot.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { useParams } from 'react-router-dom';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.progress_tab_grade_breakdown.v1': {
      plugins: [
        {
          // Insert custom content after grade summary widget
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_grade_summary_content',
            type: DIRECT_PLUGIN,
            RenderWidget: () => {
              const { courseId } = useParams();
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
