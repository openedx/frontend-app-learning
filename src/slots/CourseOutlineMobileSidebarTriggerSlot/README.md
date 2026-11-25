# Course Outline Mobile Sidebar Trigger Slot

### Slot ID: `org.openedx.frontend.slot.learning.courseOutlineMobileSidebarTrigger.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string | null` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.

## Description

This slot renders the mobile trigger of the course outline sidebar, above the sequence. Its default content is `CourseOutlineTrigger` in its mobile mode: the button that opens the sidebar full-screen, shown on narrow viewports. The desktop trigger has a slot of its own, the [Course Outline Sidebar Trigger Slot](../CourseOutlineSidebarTriggerSlot/).

## Examples

### Replaced with a custom component

Add the following to your site config to replace the mobile trigger entirely. The diff below is against this package's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.learning.courseOutlineMobileSidebarTrigger.v1',
+          id: 'org.example.widget.customMobileTrigger',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <h1 className="d-xl-none">📌</h1>,
+        },
+      ],
+    },
   ],
 };
```
