# Progress Tab Related Links Slot

### Slot ID: `org.openedx.frontend.slot.learning.progressTabRelatedLinks.v1`

### Slot Props

* `courseId: string` - the ID of the current course.

## Description

This slot renders the related links in the side panel of the Progress tab. Its default content is `RelatedLinks`: links to the course's Dates tab and outline.

## Examples

### Added custom component after the default content

![The course ID shown below the related links](./images/progress_tab_related_links_slot.png)

Add the following to your site config to show the course ID below the related links. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, type ProgressTabRelatedLinksSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const CourseIdNote = ({ courseId }: ProgressTabRelatedLinksSlotProps) => (
+  <div>
+    <p>📚: {courseId}</p>
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
+          slotId: 'org.openedx.frontend.slot.learning.progressTabRelatedLinks.v1',
+          id: 'org.example.widget.courseIdNote',
+          op: WidgetOperationTypes.APPEND,
+          component: CourseIdNote,
+        },
+      ],
+    },
   ],
 };
```

To replace the related links instead, use `op: WidgetOperationTypes.REPLACE` with `relatedId: 'defaultContent'`.
