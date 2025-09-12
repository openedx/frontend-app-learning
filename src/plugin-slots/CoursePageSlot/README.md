# Course Page 

### Slot ID: `org.openedx.frontend.learning.page.v1`

## Description

This slot is used to add new pages to the learning MFE.

## Example

### New static page 

The following `env.config.jsx` will create a new URL at `/coursepage/:courseId/test`.

The plugin should contain a Routes component with a Route component matching the path you want to 
add. Note that creating sub-routes under and existing route might not work as expected. 

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Route, Routes } from 'react-router-dom';

const CustomPage = () => (
  <Routes>
    <Route 
      path="/coursepage/:courseId/test" 
      element={<h1>Custom Page</h1>}
    />
  </Routes>
);

const config = {
  pluginSlots: {
    "org.openedx.frontend.learning.page.v1": {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_tab',
            type: DIRECT_PLUGIN,
            RenderWidget: CustomPage,
          },
        },
      ],
    },
  },
}

export default config;
```


