# Progress Tab Widget

### Widget ID: `org.openedx.frontend.widget.learning.progressTab.v1`

### Slot ID: `org.openedx.frontend.slot.learning.progressTab.v1`

Learning appends it to the [Progress Tab Slot](../../slots/ProgressTabSlot/README.md), on both progress routes.

### Props

* `courseId: string` - the ID of the course whose progress to show.
* `targetUserId?: string` - another learner's ID. Course staff see that learner's progress instead of their own.

### Query-string parameters

None.

## Description

The Progress tab: the learner's course completion, certificate status, current grade, grade breakdown and related links. While staff masquerade as a learner, it shows the access expiration banner (when the learner's access expires) and the course start banner (when the course has not started yet). While a timed exam is running, it shows the exam timer.

The package exports it as `ProgressTab`, with its props type `ProgressTabProps` and its ID as `progressTabWidgetId`. It is configured by its props alone, so it also renders on a page that is not one of Learning's. It fetches what it shows itself, the course metadata and the progress data, through the shell's query client, and brings Learning's own context (app config, user messages, toasts, tours) and stylesheet with it. Its code loads on first render, in the `learning-progress` chunk, behind the page spinner.

It reads no route params. When the progress API answers 404, it sends the browser to the LMS's legacy progress page (`<lmsBaseUrl>/courses/<courseId>/progress`), replacing the current history entry, wherever it is rendered.

The parts of the tab are slots of their own, each with its own README: [course completion](../../slots/ProgressTabCourseCompletionSlot/README.md), [certificate status in the main body](../../slots/ProgressTabCertificateStatusMainBodySlot/README.md) and [in the side panel](../../slots/ProgressTabCertificateStatusSidePanelSlot/README.md) (and [inside the certificate status](../../slots/ProgressCertificateStatusSlot/README.md)), [course grade](../../slots/ProgressTabCourseGradeSlot/README.md), [grade breakdown](../../slots/ProgressTabGradeBreakdownSlot/README.md) and [related links](../../slots/ProgressTabRelatedLinksSlot/README.md).

### Access

A learner denied access to the course sees nothing: the widget renders nothing for them. On Learning's own routes the page around the slot redirects them first (to the outline to enroll, for instance). A host page elsewhere decides for itself what to show them.

## Examples

### Replaced or removed on Learning's routes

Target the widget's ID in the slot: see the [slot's examples](../../slots/ProgressTabSlot/README.md#examples).

### Shown in another app's slot

Import the widget from the package and append it to a slot of your own app. Learning's app must be in the site's `apps` too, for its routes, its config and its roles. The diff below is against this package's `site.config.dev.tsx`; `org.example.slot.myApp.coursePanel.v1` stands for the host's slot, which passes `courseId` to its widgets.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, ProgressTab } from './src';

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
+          slotId: 'org.example.slot.myApp.coursePanel.v1',
+          id: 'org.example.widget.courseProgress',
+          op: WidgetOperationTypes.APPEND,
+          component: ProgressTab,
+        },
+      ],
+    },
   ],
 };
```

Where the slot names the course differently, or not at all, wrap the component and pass `courseId` yourself:

```tsx
const CourseProgress = ({ course }: { course: { id: string } }) => <ProgressTab courseId={course.id} />;
```

In another app's code, import it from `@openedx/frontend-app-learning`.
