# Course Page 

### Slot ID: `org.openedx.frontend.learning.course_page.v1`

### Slot ID Aliases
* `course_page`

### Props:
* `route`

## Description

This slot is used to add new course page to the learning MFE. 


## Example

### New static page 

The following `env.config.jsx` will create a new URL at `/course/:courseId/test`.

Note that you need to add a `PLUGIN_ROUTES` entry in the config as well that lists all the plugin
routes that the plugins need. A plugin will be passed this route as a prop and can match and display its content only when the route matches.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  PLUGIN_ROUTES: ["/course/:courseId/test"],
  pluginSlots: {
    "org.openedx.frontend.learning.course_page.v1": {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_tab',
            type: DIRECT_PLUGIN,
            RenderWidget: ()=> (<h1>Custom Page</h1>),
          },
        },
      ],
    },
  },
}

export default config;
```


