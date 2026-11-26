# Learning Header Widgets

Widgets Learning inserts into the shell header, so that a course page under the shell carries what the legacy Learning header (`LearningHeader` in `@edx/frontend-component-header`) did.

## Course Info

### Widget ID: `org.openedx.frontend.widget.learning.courseInfo.v1`

### Slot ID (owned by the shell): `org.openedx.frontend.slot.header.primaryLinks.v1`

### Props: none

Renders the current course's organization and number on one line and its title beneath, next to the site logo. It shows on Learning's course routes only (condition: `org.openedx.frontend.role.learningCourse` active).

The widget takes the course ID from the URL and reads the course metadata the course page has already loaded: it never fetches, and renders nothing until that metadata is there.

## Help

### Widget ID: `org.openedx.frontend.widget.header.help.v1`

### Slot ID (owned by the shell): `org.openedx.frontend.slot.header.secondaryLinks.v1`

The shell's help button, added with `helpButtonSlotOperation` on Learning's routes (condition: `org.openedx.frontend.role.learning` active). It links to `SUPPORT_URL` from Learning's app config, and renders nothing when that is not set.

## Dashboard

### Widget ID: `org.openedx.frontend.widget.learning.headerLinkDashboard.v1`

### Slot ID (owned by the shell): `org.openedx.frontend.slot.header.authenticatedMenu.v1`

A "Dashboard" item in the user menu, inserted before the shell's Logout item on Learning's routes (condition: `org.openedx.frontend.role.learning` active). It links to whatever the site resolves for the `org.openedx.frontend.role.dashboard` role, and renders nothing when no app or external route provides that role.

## Examples

### Replace the course info

The diff below is against this package's `site.config.dev.tsx`. It shows the course ID instead of the org, number and title.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';
+import { useParams } from 'react-router-dom';

 import { learningApp } from './src';

 import '@openedx/frontend-base/shell/style';

+const ShortCourseLabel = () => {
+  const { courseId = '' } = useParams();
+  return <span className="small font-weight-bold">{courseId}</span>;
+};
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
+          slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
+          id: 'org.example.widget.shortCourseLabel',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'org.openedx.frontend.widget.learning.courseInfo.v1',
+          component: ShortCourseLabel,
+        },
+      ],
+    },
   ],
 };
```

### Remove a widget

To hide one of the widgets, use a `REMOVE` operation with its widget ID as `relatedId`. For example, to drop the Dashboard item from the user menu:

```diff
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.header.authenticatedMenu.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.headerLinkDashboard.v1',
+        },
+      ],
+    },
```
