# Auxiliary Sidebar Slot

### Slot ID: `org.openedx.frontend.slot.learning.auxiliarySidebar.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string | null` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.

## Description

This slot renders the auxiliary sidebar, beside the unit content (on the right in a left-to-right locale): the panels of the sidebar widgets. It has no default content. Its layout renders only the panel of the sidebar widget that is open, and the widgets in this slot are the list of sidebar widgets the courseware page offers. Learning adds one, the discussions panel.

A sidebar widget is a panel here and a trigger in the [Auxiliary Sidebar Trigger Slot](../AuxiliarySidebarTriggerSlot/README.md), under the same widget ID, plus an optional widget options operation on the panel, for its availability and its provider. The order of the panels here is the order of the widgets: the first one available on the unit opens. The [sidebar README](../../courseware/course/sidebar/README.md) explains how to write one.

## Examples

### Add a sidebar widget

The diff below is against this package's `site.config.dev.tsx`. It adds a panel and its trigger, which opens it.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import {
+  auxiliarySidebarSlotId, auxiliarySidebarTriggerSlotId, learningApp, SidebarBase, SidebarTriggerBase,
+} from './src';

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
+          slotId: auxiliarySidebarTriggerSlotId,
+          id: 'org.example.widget.mySidebar',
+          op: WidgetOperationTypes.APPEND,
+          element: (
+            <SidebarTriggerBase sidebarId="org.example.widget.mySidebar" ariaLabel="Show my sidebar">
+              <span>📊</span>
+            </SidebarTriggerBase>
+          ),
+        },
+        {
+          slotId: auxiliarySidebarSlotId,
+          id: 'org.example.widget.mySidebar',
+          op: WidgetOperationTypes.APPEND,
+          element: (
+            <SidebarBase title="My sidebar" ariaLabel="My sidebar" sidebarId="org.example.widget.mySidebar" className="ml-4">
+              <h1>📊</h1>
+            </SidebarBase>
+          ),
+        },
+      ],
+    },
   ],
 };
```

### Remove the discussions panel

Removing a panel removes its sidebar widget, trigger included:

```diff
+        {
+          slotId: 'org.openedx.frontend.slot.learning.auxiliarySidebar.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.discussionsSidebar.v1',
+        },
```
