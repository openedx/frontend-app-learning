# ExampleSlot

A demonstration slot, rendered inside `ExamplePage`, showing how this app
exposes an extension point consumers can fill via `site.config.*.tsx`.

## Slot ID

`org.openedx.frontend.slot.template.example.v1`

## Example: appending a widget from site config

```tsx
import { WidgetOperationTypes } from '@openedx/frontend-base';
import { exampleSlotId } from '@openedx/frontend-template-application/src/slots/ExampleSlot/ExampleSlot';

const siteConfig: SiteConfig = {
  // ...
  apps: [
    {
      ...templateApp,
      slots: [
        {
          slotId: exampleSlotId,
          id: 'org.openedx.frontend.widget.template.example.hello',
          op: WidgetOperationTypes.APPEND,
          element: <p>Hello from a site-supplied widget!</p>,
        },
      ],
    },
  ],
};
```
