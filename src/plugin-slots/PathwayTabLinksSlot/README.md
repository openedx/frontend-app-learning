# Pathway Tab Links Slot

### Slot ID: `org.openedx.frontend.learning.pathway_tab_links.v1`

### Props:
* `tabs` - The tabs of the pathway, each with its `tabId`, `title` and `url`
* `activeTabSlug` - The slug of the currently active tab

## Description

This slot is used to replace/modify/hide the links in the pathway tab navigation.

By default, it renders a link for each of the pathway tabs and highlights the active one.

## Example

### Added link to Pathway Tabs

The following `env.config.jsx` will add a new pathway tab called "Custom Tab".

```js
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

import { PathwayTabLink } from '@src/pathways/pathway-tabs/PathwayTabLink';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.pathway_tab_links.v1': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_tab',
            type: DIRECT_PLUGIN,
            RenderWidget: ({ activeTabSlug }) => (
              <PathwayTabLink
                url="/some/path"
                slug="custom-link"
                title="Custom Tab"
                activeTabSlug={activeTabSlug}
              />
            ),
          },
        },
      ],
    },
  },
};

export default config;
```

To hide the default links, use `PLUGIN_OPERATIONS.Hide` with `widgetId: 'default_contents'`.
