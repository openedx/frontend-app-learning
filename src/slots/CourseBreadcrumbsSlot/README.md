# Course Breadcrumbs Slot

### Slot ID: `org.openedx.frontend.slot.learning.courseBreadcrumbs.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sectionId?: string | null` - the ID of the section holding the current sequence, once the outline has loaded.
* `sequenceId?: string | null` - the ID of the current sequence.
* `unitId?: string | null` - the ID of the current unit.
* `isStaff?: boolean` - whether the learner is course staff.

## Description

This slot renders above the sequence, at the top of the courseware page. It has no default content: a stock site shows no breadcrumbs, as in the legacy app.

## Examples

### The course breadcrumbs

This package ships the breadcrumbs the legacy app offered as an opt-in: the course home, the section and the sequence, with an optional jump navigation menu for staff. Adding them is one line of site config: see the [Course Breadcrumbs widget](../../widgets/CourseBreadcrumbs/README.md).

### Added custom component

Add the following to your site config to show something of your own in place of breadcrumbs. The diff below is against this package's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.learning.courseBreadcrumbs.v1',
+          id: 'org.example.widget.bread',
+          op: WidgetOperationTypes.APPEND,
+          element: <h1>🍞</h1>,
+        },
+      ],
+    },
   ],
 };
```
