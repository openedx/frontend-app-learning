# Course Page 

### Slot ID: `org.openedx.frontend.learning.course_page.<pageId>.v1`

## Description

This slot is used to add a new course page to the learning MFE. 


## Example

### New static page 

The following `env.config.jsx` will create a new URL at `/course/:courseId/test`.

Note that you need to add a `PLUGIN_ROUTES` entry in the config as well that lists all the plugin
routes that the plugins need. A plugin will be passed this route as a prop and can match and display 
its content only when the route matches.

`PLUGIN_ROUTES` should have a list of objects, each having a entry for `id` and `route`. Here the 
`id` should uniquely identify the page, and the route should be the react-router compatible path. 
The `id` will also form part of the slot name, for instance if you have a route with an id of 
`more-info`, the slot for that page will be `org.openedx.frontend.learning.course_page.more-info.v1`


```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  PLUGIN_ROUTES: [{ id: 'test', route: '/course/:courseId/test' }],
  pluginSlots: {
    "org.openedx.frontend.learning.course_page.test.v1": {
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


