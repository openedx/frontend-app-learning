# Learner Tools Slot

### Slot ID: `org.openedx.frontend.slot.learning.learnerTools.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string | null` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.
* `userId: number` - the signed-in learner's user ID.
* `isStaff: boolean` - whether the learner is course staff.
* `enrollmentMode: string | null` - the learner's enrollment mode, such as `audit` or `verified`.

## Description

This slot is a place for learner-facing tools during courseware navigation, such as a chat assistant. It renders through a React portal into `document.body`, so a tool can position itself over the page, and only on screens at least medium-wide and for a learner who is signed in. It has no default content: it renders nothing until a site adds a widget.

A tool checks its own feature flags and requirements, from its own config or APIs; the slot passes only where the learner is and who they are.

## Examples

### Added custom component

Add the following to your site config to show a floating help button for verified learners. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { Button } from '@openedx/paragon';

-import { learningApp } from './src';
+import { learningApp, type LearnerToolsSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const HelpButton = ({ enrollmentMode }: LearnerToolsSlotProps) => (
+  enrollmentMode === 'verified' ? (
+    <Button className="position-fixed" style={{ bottom: '1rem', right: '1rem' }}>Ask for help</Button>
+  ) : null
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
+          slotId: 'org.openedx.frontend.slot.learning.learnerTools.v1',
+          id: 'org.example.widget.helpButton',
+          op: WidgetOperationTypes.APPEND,
+          component: HelpButton,
+        },
+      ],
+    },
   ],
 };
```
