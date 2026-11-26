# Courseware sidebars

Two sidebars sit beside the unit content, in the same row:

- the **navigation sidebar** (the course outline), documented in [`sidebars/course-outline/`](sidebars/course-outline/README.md);
- the **auxiliary sidebar**, which holds the panels of the _sidebar widgets_ a site registers. Learning registers one itself, the [discussions widget](../../../widgets/DiscussionsSidebar/README.md).

One panel is open at a time, across both. `SidebarProvider` decides which, on every unit change: the course outline by default, and, for a learner who last had a widget's panel open, the first sidebar widget available on the unit, in the order of the panels in the auxiliary sidebar slot. A learner's toggles go through `useSidebar().toggleSidebar(id)`.

## Adding a sidebar widget

A sidebar widget is two slot operations under one widget ID, plus an optional third that sets its options:

| Where | What |
|---|---|
| `org.openedx.frontend.slot.learning.auxiliarySidebarTrigger.v1` ([slot](../../../slots/AuxiliarySidebarTriggerSlot/README.md)) | the trigger: the button above the unit that opens the panel |
| `org.openedx.frontend.slot.learning.auxiliarySidebar.v1` ([slot](../../../slots/AuxiliarySidebarSlot/README.md)) | the panel |
| the same slot, as a widget options operation on the panel | the widget's availability and provider |

The shared widget ID is what pairs a trigger with its panel, and what the options operation names. The panel slot is the list of sidebar widgets: options for a widget with no panel are ignored, and a trigger whose panel is gone is not rendered.

The order of the panels in their slot is the order of the widgets: the first one available on the unit is the one that opens, and the triggers follow the same order. A widget goes ahead of another the way it does in any slot, with `PREPEND` or `INSERT_BEFORE` on its panel.

```tsx
import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import {
  auxiliarySidebarSlotId,
  auxiliarySidebarTriggerSlotId,
  type AuxiliarySidebarWidgetOptions,
} from '@openedx/frontend-app-learning';

const notesSidebarId = 'org.example.widget.notesSidebar.v1';

const notesOptions: AuxiliarySidebarWidgetOptions = {
  isAvailable: ({ course }) => !!course.notes?.enabled,
};

const notesApp: App = {
  appId: 'org.example.app.notes',
  slots: [
    {
      slotId: auxiliarySidebarTriggerSlotId,
      id: notesSidebarId,
      op: WidgetOperationTypes.APPEND,
      component: NotesTrigger,
    },
    {
      slotId: auxiliarySidebarSlotId,
      id: notesSidebarId,
      op: WidgetOperationTypes.APPEND,
      component: NotesPanel,
    },
    {
      slotId: auxiliarySidebarSlotId,
      relatedId: notesSidebarId,
      op: WidgetOperationTypes.OPTIONS,
      options: { ...notesOptions },
    },
  ],
};
```

Add the app to the site config's `apps`. The smallest sidebar widget is the first two operations alone: with no options, it is always available.

### The options

```ts
interface AuxiliarySidebarWidgetOptions {
  isAvailable?: (context: SidebarAvailabilityContext) => boolean;   // per unit; default: always
  Provider?: ComponentType<{ children: ReactNode }>;                // mounted inside the sidebar provider
}
```

The package exports this type, and `SidebarAvailabilityContext`, the type of `isAvailable`'s argument. An option of the wrong kind is left out, so its default applies. When several operations set options on the same widget, they merge in the order the operations were declared, so a later app can change one option of an earlier app's widget, such as the discussions widget's availability check.

`isAvailable` is asked about the unit the learner is on, every time it changes. It receives `courseId`, `unitId`, `course` (the courseware, course home and outline metadata, merged, with every field optional, since the first check can run before the data arrives) and `unit` (the unit's discussion topic). Keep it cheap: no requests.

`Provider` wraps the whole page inside `SidebarProvider`, whether or not the widget is available, for as long as the sidebar is mounted. That is the place for state the trigger and the panel share, and for loading the data `isAvailable` reads: the trigger only mounts once the widget is available, so it cannot load that data itself. Inside it, `useSidebar()`, which the package exports, gives the course and unit IDs. A provider that needs nothing from the sidebar belongs in the app's own `providers` instead, which the shell mounts site-wide.

### The trigger and the panel

Both receive the slots' props: `courseId`, `sequenceId` and `unitId`. Wrap them in the components Learning uses for its own, for the standard look and behavior:

```tsx
import { Icon } from '@openedx/paragon';
import { EditNote } from '@openedx/paragon/icons';
import { SidebarBase, SidebarTriggerBase } from '@openedx/frontend-app-learning';

const NotesTrigger = () => (
  <SidebarTriggerBase sidebarId={notesSidebarId} ariaLabel="Show notes">
    <Icon src={EditNote} className="m-0 m-auto" />
  </SidebarTriggerBase>
);

const NotesPanel = ({ courseId, unitId }) => (
  <SidebarBase title="Notes" ariaLabel="Notes" sidebarId={notesSidebarId} className="ml-4">
    <Notes courseId={courseId} unitId={unitId} />
  </SidebarBase>
);
```

`SidebarTriggerBase` toggles the panel of the widget whose ID it is given. `SidebarBase` adds the title bar, the close button and the full-screen behavior on narrow screens, and closes itself when the page posts a `learning.events.sidebar.close` message. The trigger slot draws the marker under the trigger of the open panel.

## Removing or replacing the discussions widget

The discussions widget is registered the same way, under `org.openedx.frontend.widget.learning.discussionsSidebar.v1` (exported as `discussionsSidebarWidgetId`). Removing its panel switches it off: the trigger goes, and so do its options.

```tsx
import { App, WidgetOperationTypes } from '@openedx/frontend-base';
import { auxiliarySidebarSlotId, discussionsSidebarWidgetId } from '@openedx/frontend-app-learning';

const noDiscussionsSidebarApp: App = {
  appId: 'org.example.app.noDiscussionsSidebar',
  slots: [
    {
      slotId: auxiliarySidebarSlotId,
      op: WidgetOperationTypes.REMOVE,
      relatedId: discussionsSidebarWidgetId,
    },
  ],
};
```

To replace it, remove it this way and register your own widget under a new ID. A `condition` on its panel operation limits it the same way.

## Migrating from `SIDEBAR_WIDGETS`

The legacy app registered sidebar widgets through the `SIDEBAR_WIDGETS` key in `env.config.jsx`. That key is gone. Each field of an entry has a new home:

| `SIDEBAR_WIDGETS` field | Now |
|---|---|
| `id` | the widget ID of the two slot operations, and the `relatedId` of the options operation. Use a namespaced ID (`org.example.widget.notesSidebar.v1`). |
| `Trigger` | the trigger slot operation's `component`. It no longer receives `onClick`: it toggles its own panel, through `SidebarTriggerBase`'s `sidebarId` or `useSidebar().toggleSidebar`. |
| `Sidebar` | the panel slot operation's `component`. |
| `priority` | gone: the order of the panels in the slot. `PREPEND` the panel, or `INSERT_BEFORE` another widget's, to put it ahead. |
| `isAvailable` | the `isAvailable` option, with the same argument. |
| `Provider` | the `Provider` option, or the app's `providers` if it needs nothing from the sidebar. |
| `enabled` | gone: leave the widget out, or `REMOVE` its panel. |

The built-in upgrade widget is not part of this package. A site that wants an upsell in the sidebar registers it as its own sidebar widget. The stored sidebar of a learner who had the discussions panel open (`DISCUSSIONS`) no longer names a widget, so the sidebar falls back to its usual choice once.
