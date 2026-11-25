# Sequence Navigation Widget

### Widget ID: `org.openedx.frontend.widget.learning.sequenceNavigation.v1`

### Operation: `sequenceNavigationSlotOperation`

Appends the widget to the [Sequence Navigation Slot](../../slots/SequenceNavigationSlot/README.md).

### Options

None.

## Description

The unit tab strip above the courseware unit: a "Previous" button, a button per unit of the sequence (an icon for its type, a check once complete, a bookmark marker when bookmarked), and a "Next" button. On narrow screens, or when the units do not fit, the unit buttons collapse into a dropdown. Learning ships the strip but does not insert it, so a stock site shows none, as in the legacy app. A site adds it with the operation above.

## Examples

### Enabled

Add the operation to an app's `slots` in your site config. The diff below is against this package's `site.config.dev.tsx`.

```diff
 import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, sequenceNavigationSlotOperation } from './src';

 import '@openedx/frontend-base/shell/style';

 const siteConfig: SiteConfig = {
   // ...
   apps: [
     shellApp,
     headerApp,
     footerApp,
     learningApp,
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [sequenceNavigationSlotOperation],
+    },
   ],
 };
```
