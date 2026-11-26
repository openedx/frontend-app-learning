# Content IFrame Error Slot

### Slot ID: `org.openedx.frontend.slot.learning.contentIFrameError.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `unitId: string` - the ID of the unit whose content failed to load.

## Description

This slot renders what the learner sees when a unit's content iframe fails to load, for example when the LMS answers with an error. Its default content is frontend-base's `ErrorPage`, which offers to reload the page.

## Examples

### Replaced with a custom component

Add the following to your site config to replace the error page with a short message. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

 import { learningApp } from './src';

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
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.contentIFrameError.v1',
+          id: 'org.example.widget.customError',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <h1>🚨🤖💥</h1>,
+        },
+      ],
+    },
   ],
 };
```
