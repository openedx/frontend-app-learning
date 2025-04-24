# Course Exit "View Courses" Button Plugin Slot

### Slot ID: `org.openedx.frontend.learning.course_exit_view_courses.v1`
### Props:
* `content: { href }`

## Description

This slot is used for modifying "View Courses" button in the course exit screen

## Example

The following `env.config.jsx` will make the link link to `example.com` 

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.course_exit_view_courses.v1: {
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
