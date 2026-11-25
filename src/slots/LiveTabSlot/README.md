# Live Tab Slot

### Slot ID: `org.openedx.frontend.slot.learning.liveTab.v1`

### Slot Props

* `courseId: string` - the ID of the current course.

## Description

This slot holds the whole Live tab, on the live route of a course. Its default is Learning's own [live tab widget](../../widgets/LiveTab/README.md), registered under the ID `org.openedx.frontend.widget.learning.liveTab.v1`: the course's live sessions, shown in the LTI embed the LMS returns for the course. Target that ID to replace or remove it, or to put something beside it. A replacement receives the same props Learning's widget does.

The page around the slot sets the document title and redirects a learner denied access, whatever the slot holds.

## Examples

### Replaced with a custom component

Add the following to your site config to show your own live page in place of Learning's. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, type LiveTabSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const MyLiveSessions = ({ courseId }: LiveTabSlotProps) => (
+  <div className="container-xl py-4">
+    <h1>Live sessions for {courseId}</h1>
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
+          slotId: 'org.openedx.frontend.slot.learning.liveTab.v1',
+          id: 'org.example.widget.myLiveSessions',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'org.openedx.frontend.widget.learning.liveTab.v1',
+          component: MyLiveSessions,
+        },
+      ],
+    },
   ],
 };
```

### Removed

To leave the live page empty (the course bar and the page's title stay), remove Learning's widget:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.liveTab.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.liveTab.v1',
+        },
+      ],
+    },
   ],
 };
```

### Content added above the tab

To keep Learning's live tab and show something above it, insert a widget before it:

```diff
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.liveTab.v1',
+          id: 'org.example.widget.liveNotice',
+          op: WidgetOperationTypes.INSERT_BEFORE,
+          relatedId: 'org.openedx.frontend.widget.learning.liveTab.v1',
+          element: <div className="container-xl alert alert-info mt-3">Sessions start on the hour.</div>,
+        },
+      ],
+    },
   ],
 };
```
