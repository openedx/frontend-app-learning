# Course Outline Tab Notifications Slot

### Slot ID: `org.openedx.frontend.slot.learning.courseOutlineTabNotifications.v1`

### Slot Props

* `courseId: string` - the ID of the current course.

## Description

This slot adds notifications, announcements or other information to the sidebar of the Course Outline tab, between the Course Tools and the Course Dates widgets. It has no default content: it renders nothing until a site adds a widget.

## Examples

### Added custom component

Add the following to your site config to show an announcement card in the sidebar. The diff below is against this package's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { Button, Card } from '@openedx/paragon';

-import { learningApp } from './src';
+import { learningApp, type CourseOutlineTabNotificationsSlotProps } from './src';

 import '@openedx/frontend-base/shell/style';

+const Announcement = ({ courseId }: CourseOutlineTabNotificationsSlotProps) => (
+  <Card className="mb-3">
+    <Card.Section>
+      <h5>📢 Course Announcement</h5>
+      <p>Important updates for course {courseId}</p>
+      <Button size="sm">View Details</Button>
+    </Card.Section>
+  </Card>
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
+          slotId: 'org.openedx.frontend.slot.learning.courseOutlineTabNotifications.v1',
+          id: 'org.example.widget.announcement',
+          op: WidgetOperationTypes.APPEND,
+          component: Announcement,
+        },
+      ],
+    },
   ],
 };
```
