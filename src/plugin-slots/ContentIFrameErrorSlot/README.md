# Content iFrame Error Slot

### Slot ID: `org.openedx.frontend.learning.content_iframe_error.v1`

### Parameters: `courseId`

## Description

This slot is used to replace/modify the content iframe error page.

## Example

The following `env.config.jsx` will replace the error page with emojis.

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.content_iframe_error.v1': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_error_page',
            type: DIRECT_PLUGIN,
            RenderWidget: ({courseId}) => (
              <h1>🚨🤖💥</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
