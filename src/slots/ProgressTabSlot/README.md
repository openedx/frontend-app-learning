# Progress Tab Slot

### Slot ID: `org.openedx.frontend.slot.learning.progressTab.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `targetUserId?: string` - the ID of the learner whose progress to show, on the `progress/:targetUserId` route (staff only). Absent on the learner's own progress page.

## Description

This slot holds the whole Progress tab, on both progress routes of a course. Its default is Learning's own [progress tab widget](../../widgets/ProgressTab/README.md), registered under the ID `org.openedx.frontend.widget.learning.progressTab.v1`. Target that ID to replace or remove it, or to put something beside it. A replacement receives the same props Learning's widget does.

The page around the slot sets the document title and redirects a learner denied access, whatever the slot holds.

The progress tab's own parts have slots of their own, listed in the [slots README](../README.md#progress-tab).

## Examples

### Replaced with a custom component

Add the following to your site config to show your own progress page in place of Learning's. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, type ProgressTabSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const MyProgress = ({ courseId, targetUserId }: ProgressTabSlotProps) => (
+  <div className="container-xl py-4">
+    <h1>Progress in {courseId}</h1>
+    {targetUserId && <p>Learner: {targetUserId}</p>}
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
+          slotId: 'org.openedx.frontend.slot.learning.progressTab.v1',
+          id: 'org.example.widget.myProgress',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'org.openedx.frontend.widget.learning.progressTab.v1',
+          component: MyProgress,
+        },
+      ],
+    },
   ],
 };
```

### Removed

To leave the progress page empty (the course bar and the page's title stay), remove Learning's widget:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.progressTab.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.progressTab.v1',
+        },
+      ],
+    },
   ],
 };
```

### Content added above the tab

To keep Learning's progress tab and show something above it, insert a widget before it:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.progressTab.v1',
+          id: 'org.example.widget.progressNotice',
+          op: WidgetOperationTypes.INSERT_BEFORE,
+          relatedId: 'org.openedx.frontend.widget.learning.progressTab.v1',
+          element: <div className="container-xl alert alert-info mt-3">Grades are updated nightly.</div>,
+        },
+      ],
+    },
   ],
 };
```
