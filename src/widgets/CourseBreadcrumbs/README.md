# Course Breadcrumbs Widget

### Widget ID: `org.openedx.frontend.widget.learning.courseBreadcrumbs.v1`

### Operation: `courseBreadcrumbsSlotOperation`

Appends the widget to the [Course Breadcrumbs Slot](../../slots/CourseBreadcrumbsSlot/README.md).

### Options

* `jumpNav: boolean` (default `false`) - when `true`, course staff get a jump navigation menu: the section and sequence breadcrumbs become buttons that open a menu of the course's sections, or of the section's sequences, to jump to. Learners who are not staff always get plain links.

## Description

The breadcrumbs above the courseware sequence: a link to the course home, then the current section and the current sequence. Learning ships them but does not insert them, so a stock site shows no breadcrumbs, as in the legacy app. A site adds them with the operation above.

The `jumpNav` option replaces the legacy app's `ENABLE_JUMPNAV` config key, which is not read any more.

## Examples

### Enabled

Add the operation to an app's `slots` in your site config. The diff below is against this package's `site.config.dev.tsx`.

```diff
 import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { courseBreadcrumbsSlotOperation, learningApp } from './src';

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
+      slots: [courseBreadcrumbsSlotOperation],
+    },
   ],
 };
```

### Enabled, with jump navigation for staff

Add an `OPTIONS` operation on the widget's ID beside it:

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import {
+  courseBreadcrumbsSlotId, courseBreadcrumbsSlotOperation, courseBreadcrumbsWidgetId, learningApp,
+} from './src';

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
+        courseBreadcrumbsSlotOperation,
+        {
+          slotId: courseBreadcrumbsSlotId,
+          op: WidgetOperationTypes.OPTIONS,
+          relatedId: courseBreadcrumbsWidgetId,
+          options: { jumpNav: true },
+        },
+      ],
+    },
   ],
 };
```
