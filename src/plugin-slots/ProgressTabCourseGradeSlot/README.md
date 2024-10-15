# Progress Tab Course Grade Slot

### Slot ID: `progress_tab_course_grade_slot`
### Props:
* `courseId`

## Description

This slot is used to replace or modify the Course Grades view in the Progress Tab.

## Example

The following `env.config.jsx` will render the `course_id` and `unit_id` of the course as `<p>` elements in a `<div>`.

![Screenshot of Content added after the Sequence Container](./images/post_sequence_container.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    progress_tab_course_grade_slot: {
      plugins: [
        {
          // Insert custom content after course grade widget
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_grade_content',
            type: DIRECT_PLUGIN,
            RenderWidget: ({courseId}) => (
              <div>
                <p>📚: {courseId}</p>
              </div>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
