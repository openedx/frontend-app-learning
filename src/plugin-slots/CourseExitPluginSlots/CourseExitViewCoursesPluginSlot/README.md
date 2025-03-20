# Course Exit "View Courses" Button Plugin Slot

### Slot ID: `course_exit_view_courses_slot`
### Props:
* `href`

## Description

This slot is used for modifying "View Courses" button in the course exit screen

## Example

The following `env.config.jsx` will make the link link to `example.com` 

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    course_exit_view_courses_slot: {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Modify,
          widgetId: 'default_contents',
          fn: (widget) => {
            widget.content.href = 'http://www.example.com';
            return widget;
          }
        },
      ]
    },
  },
}

export default config;
```
