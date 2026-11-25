# Next Unit Top Navigation Trigger Slot

### Slot ID: `org.openedx.frontend.slot.learning.nextUnitTopNavTrigger.v1`

### Slot Props

* `disabled: boolean` - whether there is nowhere to go next.
* `buttonText?: string` - the button's label: "Next", or the end-of-course text on the last unit; unset on narrow screens in the unit tab strip.
* `nextLink?: string` - the path to navigate to, ready for the router: the next unit, the next sequence's first unit, or the course end page. It carries the `/preview` prefix while previewing.
* `sequenceId: string` - the ID of the current sequence.
* `onClickHandler: () => void` - call when the learner clicks; it logs the event and does the sequence's own bookkeeping. Navigating to `nextLink` is up to the widget.
* `variant: string` - the Paragon button variant the default button uses.
* `buttonStyle: string` - the class names the default button uses.
* `isAtTop?: boolean` - `true` beside the unit title, where the default is a compact arrow; unset in the unit tab strip.

## Description

This slot renders the "Next" control at the top of a unit: the arrow beside the unit title, and the "Next" button at the end of the unit tab strip when a site adds it. Its default content is `NextButton`.

## Examples

### Replaced with a custom component

Add the following to your site config to replace the next control with a button of your own that still navigates. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { useNavigate } from 'react-router-dom';

-import { learningApp } from './src';
+import { learningApp, type NextUnitTopNavTriggerSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const ChartButton = ({ disabled, nextLink, onClickHandler }: NextUnitTopNavTriggerSlotProps) => {
+  const navigate = useNavigate();
+  return (
+    <button
+      type="button"
+      disabled={disabled}
+      onClick={() => {
+        onClickHandler();
+        if (nextLink) {
+          navigate(nextLink);
+        }
+      }}
+    >
+      📊
+    </button>
+  );
+};
+
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     shellApp,
     headerApp,
     footerApp,
     learningApp,
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.nextUnitTopNavTrigger.v1',
+          id: 'org.example.widget.chartButton',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: ChartButton,
+        },
+      ],
+    },
   ],
 };
```
