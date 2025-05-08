# Course Exit Dashboard Footnote Link Plugin Slot

### Slot ID: `org.openedx.frontend.learning.course_exit_dashboard_footnote_link.v1`
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
    'org.openedx.frontend.learning.course_exit_dashboard_footnote_link.v1': {
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
