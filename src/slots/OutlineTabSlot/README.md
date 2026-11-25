# Outline Tab Slot

### Slot ID: `org.openedx.frontend.slot.learning.outlineTab.v1`

### Slot Props

* `courseId: string` - the ID of the current course.

## Description

This slot holds the whole Course Outline tab, on the outline route (`/learning/course/:courseId/home`). Its default is Learning's own [outline tab widget](../../widgets/OutlineTab/README.md), registered under the ID `org.openedx.frontend.widget.learning.outlineTab.v1`. Target that ID to replace or remove it, or to put something beside it. A replacement receives the same props Learning's widget does.

The page around the slot sets the document title and redirects a learner denied access, whatever the slot holds.

## Examples

### Replaced with a custom component

Add the following to your site config to show your own outline in place of Learning's. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, type OutlineTabSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const MyOutline = ({ courseId }: OutlineTabSlotProps) => (
+  <div className="container-xl py-4">
+    <h1>My outline for {courseId}</h1>
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
+          slotId: 'org.openedx.frontend.slot.learning.outlineTab.v1',
+          id: 'org.example.widget.myOutline',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'org.openedx.frontend.widget.learning.outlineTab.v1',
+          component: MyOutline,
+        },
+      ],
+    },
   ],
 };
```

### Removed

To leave the outline page empty (the course bar and the page's title stay), remove Learning's widget:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.outlineTab.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.outlineTab.v1',
+        },
+      ],
+    },
   ],
 };
```

### Content added above the tab

To keep Learning's outline and show something above it, insert a widget before it:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.outlineTab.v1',
+          id: 'org.example.widget.outlineNotice',
+          op: WidgetOperationTypes.INSERT_BEFORE,
+          relatedId: 'org.openedx.frontend.widget.learning.outlineTab.v1',
+          element: <div className="container-xl alert alert-info mt-3">Welcome back!</div>,
+        },
+      ],
+    },
   ],
 };
```
