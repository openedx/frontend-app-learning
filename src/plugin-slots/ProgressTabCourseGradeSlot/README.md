# Progress Tab Course Grade Slot

### Slot ID: `progress_tab_course_grade_slot`
### Props:
* `courseId`

## Description

This slot is used to replace or modify the Course Grades view in the Progress Tab.

## Example

The following `env.config.jsx` will render the `course_id` of the course as a `<p>` element in a `<div>`.

![Screenshot of Content added after the Grades Container](./images/progress_tab_course_grade_slot.png)

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
