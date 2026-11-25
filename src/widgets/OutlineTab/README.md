# Outline Tab Widget

### Widget ID: `org.openedx.frontend.widget.learning.outlineTab.v1`

### Slot ID: `org.openedx.frontend.slot.learning.outlineTab.v1`

Learning appends it to the [Outline Tab Slot](../../slots/OutlineTabSlot/README.md), on the outline route.

### Props

* `courseId: string` - the ID of the course whose outline to show.

### Query-string parameters

It reads these from the URL of the page it is on, and strips them from the address once handled:

* `start_course=1` - send the `enrollment.email.clicked.startcourse` event.
* `weekly_goal=1`, `3` or `5` - set the learner's weekly learning goal to that many days, when the course has weekly goals enabled.

## Description

The Course Outline tab: the course title, its alerts, the start or resume card, the welcome message, the sections and subsections, and the sidebar (proctoring info, weekly learning goal, course tools, dates and handouts).

The package exports it as `OutlineTab`, with its props type `OutlineTabProps` and its ID as `outlineTabWidgetId`. It is configured by its props alone, so it also renders on a page that is not one of Learning's. It fetches what it shows itself, the course metadata and the outline plus the learner's tour state and proctoring onboarding status, through the shell's query client, and brings Learning's own context (app config, user messages, toasts, tours) and stylesheet with it. Its code loads on first render, in the `learning-outline` chunk, behind the page spinner.

It reads no route params. Besides the query-string parameters above, it runs the course home product tours: the new and existing learner tours, the abandon tour, and the button that launches the tour again. Links in the outline go to Learning's own pages (courseware, dates, progress), resolved by role.

### Access

Unlike the other tab widgets, which render nothing for a learner denied access to the course, the outline shows such a learner its private view, with the alerts that ask them to enroll or sign in. On Learning's own route the page around the slot redirects them first where the denial calls for it (a survey, a consent form, an enterprise portal). A host page elsewhere decides for itself what to show them.

## Examples

### Replaced or removed on Learning's route

Target the widget's ID in the slot: see the [slot's examples](../../slots/OutlineTabSlot/README.md#examples).

### Shown in another app's slot

Import the widget from the package and append it to a slot of your own app. Learning's app must be in the site's `apps` too, for its routes, its config and its roles. The diff below is against this package's `site.config.dev.tsx`; `org.example.slot.myApp.coursePanel.v1` stands for the host's slot, which passes `courseId` to its widgets.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { learningApp, OutlineTab } from './src';

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
+          id: 'org.example.widget.courseOutline',
+          op: WidgetOperationTypes.APPEND,
+          component: OutlineTab,
+        },
+      ],
+    },
   ],
 };
```

Where the slot names the course differently, or not at all, wrap the component and pass `courseId` yourself:

```tsx
const CourseOutline = ({ course }: { course: { id: string } }) => <OutlineTab courseId={course.id} />;
```

In another app's code, import it from `@openedx/frontend-app-learning`.
