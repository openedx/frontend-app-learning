# Gated Unit Content Message Slot

### Slot ID: `org.openedx.frontend.slot.learning.gatedUnitContentMessage.v1`

### Slot Props

* `courseId: string` - the ID of the current course.
* `sequenceId: string` - the ID of the sequence holding the unit.
* `unitId: string` - the ID of the unit whose content is gated.

## Description

This slot renders the message shown above a unit whose content is gated to learners who have not upgraded, such as graded assignments for an audit learner. It renders only when the course has content type gating enabled and the unit contains gated content. Its default content is `LockPaywall`, which lists the benefits of upgrading and links to the upgrade.

## Examples

### Replaced with a custom component

Add the following to your site config to replace the paywall with a message of your own. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { Alert, Button } from '@openedx/paragon';

-import { learningApp } from './src';
+import { learningApp, type GatedUnitContentMessageSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const PremiumContent = ({ courseId }: GatedUnitContentMessageSlotProps) => (
+  <Alert variant="warning">
+    <Alert.Heading>Premium Content</Alert.Heading>
+    <p>This content is available to verified learners only.</p>
+    <p>Upgrade your enrollment for course {courseId} to access:</p>
+    <ul>
+      <li>Graded assignments and quizzes</li>
+      <li>A verified certificate upon completion</li>
+    </ul>
+    <Button variant="success">Upgrade Now</Button>
+  </Alert>
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
+          slotId: 'org.openedx.frontend.slot.learning.gatedUnitContentMessage.v1',
+          id: 'org.example.widget.premiumContent',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: PremiumContent,
+        },
+      ],
+    },
   ],
 };
```
