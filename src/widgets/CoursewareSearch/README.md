# Courseware Search Widget

### Widget ID: `org.openedx.frontend.widget.learning.coursewareSearch.v1`

### Slot ID (owned by the shell): `org.openedx.frontend.slot.header.courseNavigationBar.extraContent.v1`

### Props: none

## Description

Courseware search: a "Search" button at the end of the shell's course bar, and the search panel it opens beneath the bar's top edge. The panel searches the course's content, filters the results by type, and links each result to its place in the course. Learning inserts it on its course routes only (condition: `org.openedx.frontend.role.learningCourse` active).

The widget renders nothing unless the LMS reports courseware search enabled for the course (the `courseware.mfe_courseware_search` waffle flag). A link to a course page with `?q=<keywords>` opens the panel with that search on load.

The widget takes the course ID from the URL. Its code loads on first render, in a chunk of its own.

## Examples

### Remove the widget

A site that does not want courseware search removes the widget by its ID. The diff below is against this package's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.header.courseNavigationBar.extraContent.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.coursewareSearch.v1',
+        },
+      ],
+    },
   ],
 };
```
