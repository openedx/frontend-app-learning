# Sequence Navigation Slot

### Slot ID: `org.openedx.frontend.slot.learning.sequenceNavigation.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string` - the ID of the current sequence.
* `unitId: string | null` - the ID of the current unit.
* `nextHandler: () => void` - call when the learner moves to the next unit; it logs the event and does the sequence's own bookkeeping. Navigating is up to the widget.
* `onNavigate: (unitId: string) => void` - call when the learner picks a unit directly, with that unit's ID.
* `previousHandler: () => void` - call when the learner moves to the previous unit.

## Description

This slot renders above the unit, at the top of the sequence. It has no default content: a stock site shows no unit navigation here, as in the legacy app, and the learner moves with the previous and next buttons beside the unit title and below the unit.

## Examples

### The unit tab strip

This package ships the unit tab strip the legacy app offered as an opt-in: a row with a button per unit between the previous and next buttons. Adding it is one line of site config: see the [Sequence Navigation widget](../../widgets/SequenceNavigation/README.md).

### Replaced with a custom component

Add the following to your site config to render your own navigation with every prop the slot passes. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { Button, Stack } from '@openedx/paragon';

-import { learningApp } from './src';
+import { learningApp, type SequenceNavigationSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+// Mock unit data for demonstration.
+const units = ['unit-1', 'unit-2', 'unit-3'];
+
+const CustomNavigation = ({
+  unitId, nextHandler, onNavigate, previousHandler,
+}: SequenceNavigationSlotProps) => (
+  <Stack gap={2} direction="horizontal" className="p-3 bg-light w-100">
+    <Button className="flex-grow-1" onClick={previousHandler}>⬅️ Previous</Button>
+    <Stack gap={2} direction="horizontal">
+      {units.map((unit, index) => (
+        <Button
+          key={unit}
+          size="sm"
+          variant={unitId === unit ? 'primary' : 'outline-secondary'}
+          onClick={() => onNavigate(unit)}
+        >
+          {index + 1}
+        </Button>
+      ))}
+    </Stack>
+    <Button className="flex-grow-1" onClick={nextHandler}>Next ➡️</Button>
+  </Stack>
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
+          slotId: 'org.openedx.frontend.slot.learning.sequenceNavigation.v1',
+          id: 'org.example.widget.customNavigation',
+          op: WidgetOperationTypes.APPEND,
+          component: CustomNavigation,
+        },
+      ],
+    },
   ],
 };
```
