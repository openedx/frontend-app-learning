# Banner Dates Upgrade Slot

### Slot ID: `org.openedx.frontend.slot.learning.bannerDatesUpgrade.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `logUpgradeLinkClick: () => void` - sends the analytics event for a click on an upgrade link; call it from your own upgrade link.

## Description

This slot renders the upgrade messaging in the suggested schedule banner of the Dates tab, which appears for self-paced courses with assignment deadlines. Its default content is `UpgradeToCompleteAlert`, which shows only to learners who can upgrade to unlock graded content.

## Examples

### Replaced with a custom component

Add the following to your site config to replace the default upgrade alert with your own banner. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, type BannerDatesUpgradeSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const UpgradeBanner = ({ logUpgradeLinkClick }: BannerDatesUpgradeSlotProps) => (
+  <div>
+    Replacement banner
+    <button type="button" onClick={logUpgradeLinkClick}>Upgrade here</button>
+  </div>
+);
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
+          slotId: 'org.openedx.frontend.slot.learning.bannerDatesUpgrade.v1',
+          id: 'org.example.widget.upgradeBanner',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: UpgradeBanner,
+        },
+      ],
+    },
   ],
 };
```
