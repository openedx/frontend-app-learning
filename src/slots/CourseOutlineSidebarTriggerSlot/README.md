# Course Outline Sidebar Trigger Slot

### Slot ID: `org.openedx.frontend.slot.learning.courseOutlineSidebarTrigger.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sectionId: string | null` - the ID of the section holding the current sequence.
* `sequenceId: string | null` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.
* `isStaff: boolean | undefined` - whether the learner is course staff.

## Description

This slot renders the desktop trigger of the course outline sidebar, to the left of the unit content. Its default content is `CourseOutlineTrigger` in its desktop mode: the button that opens the sidebar, shown on wide viewports while the sidebar is closed. The mobile trigger has a slot of its own, the [Course Outline Mobile Sidebar Trigger Slot](../CourseOutlineMobileSidebarTriggerSlot/).

## Examples

### Replaced with a custom component

Add the following to your site config to replace the desktop trigger entirely. The diff below is against this package's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.learning.courseOutlineSidebarTrigger.v1',
+          id: 'org.example.widget.customTrigger',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <h1 className="d-none d-xl-block">📌</h1>,
+        },
+      ],
+    },
   ],
 };
```

### Replaced with a component that reads the slot's props

A widget receives the slot's props, so it can show where the learner is:

```diff
+import { learningApp, type CourseOutlineSidebarTriggerSlotProps } from './src';
+
+const UnitBadge = ({ unitId, isStaff }: CourseOutlineSidebarTriggerSlotProps) => (
+  <span className="d-none d-xl-block">{isStaff ? `Staff view of ${unitId}` : unitId}</span>
+);
+
+        {
+          slotId: 'org.openedx.frontend.slot.learning.courseOutlineSidebarTrigger.v1',
+          id: 'org.example.widget.unitBadge',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: UnitBadge,
+        },
```
