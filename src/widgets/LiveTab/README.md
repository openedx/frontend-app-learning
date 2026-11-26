# Live Tab Widget

### Widget ID: `org.openedx.frontend.widget.learning.liveTab.v1`

### Slot ID: `org.openedx.frontend.slot.learning.liveTab.v1`

Learning appends it to the [Live Tab Slot](../../slots/LiveTabSlot/README.md), on the live route.

### Props

* `courseId: string` - the ID of the course whose live sessions to show.

### Query-string parameters

None.

## Description

The Live tab: the LTI embed the LMS returns for the course, sized to fill the page. The embed is whatever the course's live provider is configured to show (Zoom, BigBlueButton and the like). A course with no live configuration gets an empty tab.

The package exports it as `LiveTab`, with its props type `LiveTabProps` and its ID as `liveTabWidgetId`. It is configured by its props alone, so it also renders on a page that is not one of Learning's. It fetches what it shows itself, the course metadata and the embed, through the shell's query client, and brings Learning's own context (app config, user messages, toasts, tours) and stylesheet with it. Its code loads on first render, in the `learning-live` chunk, behind the page spinner.

It reads no route params, and does not navigate.

### Access

A learner denied access to the course sees nothing: the widget renders nothing for them. On Learning's own route the page around the slot redirects them first (to the outline to enroll, for instance). A host page elsewhere decides for itself what to show them.

## Examples

### Replaced or removed on Learning's route

Target the widget's ID in the slot: see the [slot's examples](../../slots/LiveTabSlot/README.md#examples).

### Shown in another app's slot

Import the widget from the package and append it to a slot of your own app. Learning's app must be in the site's `apps` too, for its routes, its config and its roles. The diff below is against this package's `site.config.dev.tsx`; `org.example.slot.myApp.coursePanel.v1` stands for the host's slot, which passes `courseId` to its widgets.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { LiveTab, learningApp } from './src';

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
+          id: 'org.example.widget.courseLive',
+          op: WidgetOperationTypes.APPEND,
+          component: LiveTab,
+        },
+      ],
+    },
   ],
 };
```

Where the slot names the course differently, or not at all, wrap the component and pass `courseId` yourself:

```tsx
const CourseLive = ({ course }: { course: { id: string } }) => <LiveTab courseId={course.id} />;
```

In another app's code, import it from `@openedx/frontend-app-learning`.
