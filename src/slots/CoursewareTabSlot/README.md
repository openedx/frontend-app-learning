# Courseware Tab Slot

### Slot ID: `org.openedx.frontend.slot.learning.coursewareTab.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId?: string` - the second segment of the courseware path: usually a sequence ID, but it may be a section or unit ID, or missing at the course root.
* `unitId?: string` - the third segment of the courseware path: usually a unit ID (or `first` or `last`), or missing.
* `isPreview?: boolean` - `true` on the preview routes (`/learning/preview/course/...`), where course staff see the course as a learner would; missing elsewhere.

## Description

This slot holds the whole courseware, on the courseware and preview routes of a course. Its default is Learning's own [courseware tab widget](../../widgets/CoursewareTab/README.md), registered under the ID `org.openedx.frontend.widget.learning.coursewareTab.v1`: the sequence and its unit, the sidebars and everything around them. Target that ID to replace or remove it, or to put something beside it. A replacement receives the same props Learning's widget does.

The page around the slot sets the document title and redirects a learner denied access, whatever the slot holds.

## Examples

### Replaced with a custom component

Add the following to your site config to show your own courseware in place of Learning's. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, type CoursewareTabSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const MyCourseware = ({ courseId, sequenceId, unitId }: CoursewareTabSlotProps) => (
+  <main>
+    <p>Course: {courseId}</p>
+    <p>Sequence: {sequenceId}</p>
+    <p>Unit: {unitId}</p>
+  </main>
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
+          slotId: 'org.openedx.frontend.slot.learning.coursewareTab.v1',
+          id: 'org.example.widget.myCourseware',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'org.openedx.frontend.widget.learning.coursewareTab.v1',
+          component: MyCourseware,
+        },
+      ],
+    },
   ],
 };
```

### Removed

To leave the courseware page empty (the course bar and the page's title stay), remove Learning's widget:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.coursewareTab.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.coursewareTab.v1',
+        },
+      ],
+    },
   ],
 };
```

### Content added above the tab

To keep Learning's courseware and show something above it, insert a widget before it:

```diff
+const CourseNotice = ({ courseId }: CoursewareTabSlotProps) => (
+  <div className="container-xl py-2">Welcome to {courseId}!</div>
+);
+
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.coursewareTab.v1',
+          id: 'org.example.widget.courseNotice',
+          op: WidgetOperationTypes.INSERT_BEFORE,
+          relatedId: 'org.openedx.frontend.widget.learning.coursewareTab.v1',
+          component: CourseNotice,
+        },
+      ],
+    },
   ],
 };
```
