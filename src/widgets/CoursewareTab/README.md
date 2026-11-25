# Courseware Tab Widget

### Widget ID: `org.openedx.frontend.widget.learning.coursewareTab.v1`

### Slot ID: `org.openedx.frontend.slot.learning.coursewareTab.v1`

Learning appends it to the [Courseware Tab Slot](../../slots/CoursewareTabSlot/README.md), on the courseware and preview routes.

### Props

* `courseId: string` - the ID of the course to show.
* `sequenceId?: string` - the sequence to show. It may be missing, or hold a section or unit ID instead: see below.
* `unitId?: string` - the unit to show, or `first` or `last` for the sequence's first or last unit. It may be missing.
* `isPreview?: boolean` (default `false`) - show the course as course staff preview it, with its unreleased content. A learner who is not course staff is sent to the same place off the preview routes.

### Query-string parameters

It reads these from the URL of the page it is on:

* `sidebar=true` - open the auxiliary sidebar on load, also on narrow screens.
* `jumpToId=<block ID>` - scroll the unit's content to that block once it loads.

## Description

The courseware: the unit's content and its previous and next buttons, the sequence around it, the navigation sidebar, the auxiliary sidebars, the special exams and the celebrations.

The package exports it as `CoursewareTab`, with its props type `CoursewareTabProps` and its ID as `coursewareTabWidgetId`. It is configured by its props alone, so it also renders on a page that is not one of Learning's. It fetches what it shows itself, the course metadata, the courseware metadata, the course outline and the sequence, through the shell's query client, and brings Learning's own context (app config, user messages, toasts, tours) and stylesheet with it. Its code loads on first render, in the `learning-courseware` chunk, behind the page spinner.

The many slots inside the courseware have READMEs of their own: see the [slots index](../../slots/README.md).

### Liberal paths

`sequenceId` and `unitId` need not name a sequence and one of its units: the widget accepts what the courseware's URLs accept ([ADR 0008](../../../docs/decisions/0008-liberal-courseware-path-handling.md)) and resolves it by redirecting to the full path:

1. No `sequenceId`: the learner's last position in the course, else the course's first sequence.
2. A section ID as `sequenceId`: the section's first sequence.
3. A section ID and a unit ID: the unit, with the section dropped (then case 5).
4. A sequence and no `unitId`: the sequence's active unit, else its first one. `first` and `last` go to those units.
5. A unit ID as `sequenceId`, with no `unitId`: the sequence the unit belongs to, then the unit.

An ID that is none of these goes to the course root (case 1). When the course outline fails to load, it goes to the course's outline.

### Navigation

All of the widget's navigation goes to Learning's own courseware routes, which it finds by role (`org.openedx.frontend.role.courseware`): the previous and next buttons, the navigation sidebar's links, the redirects above, and the redirect that sends a learner who is not course staff off the preview routes. So the widget is reusable on a site where Learning's routes exist, and the learner leaves the host page as soon as they move. It never reads route params or the path of the page it is on.

### Access

A learner denied access to the course sees nothing: the widget renders nothing for them. On Learning's own routes the page around the slot redirects them first (to the outline, the access-denied page, or wherever the course sends them). A host page elsewhere decides for itself what to show them.

### Landmark

The widget renders its own `<main>` landmark, around the sequence and with the sidebars outside it. A host page should not put it inside another `<main>`.

## Examples

### Replaced or removed on Learning's routes

Target the widget's ID in the slot: see the [slot's examples](../../slots/CoursewareTabSlot/README.md#examples).

### Shown in another app's slot

Import the widget from the package and append it to a slot of your own app. Learning's app must be in the site's `apps` too, for its routes, its config and its roles. The diff below is against this package's `site.config.dev.tsx`; `org.example.slot.myApp.coursePanel.v1` stands for the host's slot, which passes `courseId` (and, where it has them, `sequenceId` and `unitId`) to its widgets.

```diff
-import { EnvironmentTypes, SiteConfig, footerApp, headerApp, shellApp } from '@openedx/frontend-base';
+import {
+  EnvironmentTypes, SiteConfig, WidgetOperationTypes, footerApp, headerApp, shellApp,
+} from '@openedx/frontend-base';

-import { learningApp } from './src';
+import { CoursewareTab, learningApp } from './src';

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
+          id: 'org.example.widget.courseware',
+          op: WidgetOperationTypes.APPEND,
+          component: CoursewareTab,
+        },
+      ],
+    },
   ],
 };
```

Where the slot names the course differently, or not at all, wrap the component and pass the IDs yourself:

```tsx
const DemoCourseware = () => (
  <CoursewareTab courseId="course-v1:edX+DemoX+Demo_Course" sequenceId="block-v1:edX+DemoX+Demo_Course+type@sequential+block@basic_questions" />
);
```

In another app's code, import it from `@openedx/frontend-app-learning`.

