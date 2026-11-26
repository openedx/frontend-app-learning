# Auxiliary Sidebar Trigger Slot

### Slot ID: `org.openedx.frontend.slot.learning.auxiliarySidebarTrigger.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string | null` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.

## Description

This slot renders the triggers of the auxiliary sidebar, the buttons above the unit, beside the breadcrumbs, that open its panels. It has no default content. Its layout renders the trigger of each sidebar widget that is available on the unit, in the order of the panels in the auxiliary sidebar slot, and marks the one whose panel is open. Learning adds one, the discussions trigger.

A trigger only renders when the [Auxiliary Sidebar Slot](../AuxiliarySidebarSlot/README.md) holds a panel under the same widget ID: a trigger is half of a sidebar widget, and the panel slot is where the sidebar finds its widgets. The [sidebar README](../../courseware/course/sidebar/README.md) explains how to write one, and the Auxiliary Sidebar Slot's README has a site config example that adds both halves.

## Examples

### Replace the discussions trigger

A trigger toggles its own panel, by its widget ID. This replaces the discussions widget's trigger with one of your own, keeping its panel. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, SidebarTriggerBase } from './src';

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
+          slotId: 'org.openedx.frontend.slot.learning.auxiliarySidebarTrigger.v1',
+          id: 'org.openedx.frontend.widget.learning.discussionsSidebar.v1',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'org.openedx.frontend.widget.learning.discussionsSidebar.v1',
+          element: (
+            <SidebarTriggerBase
+              sidebarId="org.openedx.frontend.widget.learning.discussionsSidebar.v1"
+              ariaLabel="Show discussions tray"
+            >
+              <span>📬</span>
+            </SidebarTriggerBase>
+          ),
+        },
+      ],
+    },
   ],
 };
```
