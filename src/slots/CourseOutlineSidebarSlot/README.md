# Course Outline Sidebar Slot

### Slot ID: `org.openedx.frontend.slot.learning.courseOutlineSidebar.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string | null` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.

## Description

This slot renders the course outline sidebar, to the left of the unit content. Its default content is `CourseOutlineTray`: the navigation sidebar with the course's sections, sequences and units, shown while the learner has it open.

## Examples

### Replaced with a custom component

Add the following to your site config to replace the course outline sidebar entirely. The diff below is against this package's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.learning.courseOutlineSidebar.v1',
+          id: 'org.example.widget.customSidebar',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <h1>📊</h1>,
+        },
+      ],
+    },
   ],
 };
```

### Hidden

To hide the course outline sidebar, remove its default content:

```diff
+        {
+          slotId: 'org.openedx.frontend.slot.learning.courseOutlineSidebar.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'defaultContent',
+        },
```
