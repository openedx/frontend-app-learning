# Discussions Sidebar Widget

### Widget ID: `org.openedx.frontend.widget.learning.discussionsSidebar.v1`

### Slot IDs (owned by Learning)

* `org.openedx.frontend.slot.learning.auxiliarySidebarTrigger.v1` - the trigger
* `org.openedx.frontend.slot.learning.auxiliarySidebar.v1` - the panel

### Props: `courseId`, `unitId` (from the slots)

## Description

The in-context discussions panel of the courseware page: a trigger above the unit, and a panel beside it that embeds the Discussions app for the unit's discussion topic in an iframe. Learning registers it by default, as a [sidebar widget](../../courseware/course/sidebar/README.md): one operation in each auxiliary sidebar slot under the widget ID, and these options on its panel:

| Option | Value |
|---|---|
| `isAvailable` | the unit has a discussion topic enabled in context, and something provides the discussions sidebar role |
| `Provider` | loads the course's discussion topics, once the course metadata shows a discussion tab |

The panel embeds whatever the site provides for the role `org.openedx.frontend.role.discussionsSidebar`: a converted Discussions app's chromeless route, or an external route the site declares. The iframe loads that route followed by `/<course id>/category/<unit id>`. When nothing provides the role, the widget is not available: no trigger, no panel, and the topics are not requested.

The role name and the sub-path are not settled yet on the Discussions side (openedx/frontend-app-discussions#802). The legacy Discussions MFE only drops its header and footer when it is given a query parameter this widget does not add, so pointing the role at it as it is gives a sidebar with the full Discussions page in it.

The trigger and the panel load on first render, in a chunk of their own.

## Examples

### Point the role at an external Discussions deployment

The diff below is against this package's `site.config.dev.tsx`.

```diff
 const siteConfig: SiteConfig = {
   // ...
   externalRoutes: [
     // ...
+    { role: 'org.openedx.frontend.role.discussionsSidebar', url: 'http://apps.local.openedx.io:2002/discussions/sidebar' },
   ],
 };
```

### Remove the widget

Removing the panel removes the whole widget:

```diff
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.auxiliarySidebar.v1',
+          op: WidgetOperationTypes.REMOVE,
+          relatedId: 'org.openedx.frontend.widget.learning.discussionsSidebar.v1',
+        },
+      ],
+    },
```

### Put another widget ahead of it

The first widget available on a unit is the one that opens, in the order of the panels. A panel inserted before this one comes first:

```diff
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.auxiliarySidebar.v1',
+          id: 'org.example.widget.notesSidebar.v1',
+          op: WidgetOperationTypes.INSERT_BEFORE,
+          relatedId: 'org.openedx.frontend.widget.learning.discussionsSidebar.v1',
+          component: NotesPanel,
+        },
+      ],
+    },
```

### Change when it is available

A widget options operation on its panel changes the options it names, and leaves the others as Learning set them:

```diff
+    {
+      appId: 'org.example.app.myPlugin',
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.learning.auxiliarySidebar.v1',
+          relatedId: 'org.openedx.frontend.widget.learning.discussionsSidebar.v1',
+          op: WidgetOperationTypes.OPTIONS,
+          options: { isAvailable: ({ unit }) => !!unit?.id },
+        },
+      ],
+    },
```
