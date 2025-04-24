# Unit Title Slot

### Slot ID: `org.openedx.frontend.learning.course_recommendations.v1`

### Slot ID Aliases
* `course_recommendations_slot`

### Props:
* `variant`

## Description

This slot is used for modifying the course end recommendation 

## Example

The following `env.config.jsx` will replace the course recommendations with a thumbs up 

![Screenshot of modified course celebration](./screenshot_custom.png)

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.course_recommendations.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'inserted_direct_plugin',
            type: DIRECT_PLUGIN,
            priority: 10,
            RenderWidget: () => (<div >👍</div>),
          },
        },
      ]
    },
  },
}

export default config;
```
