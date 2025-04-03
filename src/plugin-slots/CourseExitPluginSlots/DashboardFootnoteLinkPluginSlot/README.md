# Course Exit Dashboard Footnote Link Plugin Slot

### Slot ID: `course_exit_dashboard_footnote_link_slot`
### Props:
* `variant`
* `content: { destination }`

## Description

This slot is used for modifying the link to the learner dashboard in the footnote on the course exit page

## Example

The following `env.config.jsx` will change the link to point to `example.com` 

![Screenshot of modified course celebration](./screenshot_custom.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    course_exit_dashboard_footnote_link_slot: {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Modify,
          widgetId: 'default_contents',
          fn: (widget) => {
            widget.content.destination = 'http://www.example.com';
            return widget;
          }
        },
      ]
    },
  },
}

export default config;
```
