# Widgets

The widgets Learning provides, one directory each, with a README giving the widget's ID, the slot it goes in, the options it reads and examples. A widget's ID and options are part of Learning's contract.

All widget IDs share the prefix `org.openedx.frontend.widget.learning.` and end in `.v1`, except the help button, which is the shell's own widget.

## Inserted by default

Learning's app declares these in its `slots` (see `src/slots.tsx`), so every site that includes `learningApp` gets them. A site changes or removes one with an operation that targets its widget ID.

| Widget | ID | Slot |
|---|---|---|
| [Course info](./LearningHeader/README.md#course-info) | `courseInfo` | the shell's header, `org.openedx.frontend.slot.header.primaryLinks.v1` |
| [Help](./LearningHeader/README.md#help) | `org.openedx.frontend.widget.header.help.v1` | the shell's header, `org.openedx.frontend.slot.header.secondaryLinks.v1` |
| [Dashboard menu item](./LearningHeader/README.md#dashboard) | `headerLinkDashboard` | the shell's header, `org.openedx.frontend.slot.header.authenticatedMenu.v1` |
| [Courseware search](./CoursewareSearch/README.md) | `coursewareSearch` | the shell's course bar, `org.openedx.frontend.slot.header.courseNavigationBar.extraContent.v1` |
| [Discussions sidebar](./DiscussionsSidebar/README.md) | `discussionsSidebar` (exported as `discussionsSidebarWidgetId`) | Learning's [auxiliary sidebar](../slots/AuxiliarySidebarSlot/README.md) and [its trigger slot](../slots/AuxiliarySidebarTriggerSlot/README.md) |

### The tabs

Each of Learning's tabs is a widget too, but these go into Learning's own slots, not the shell's: one slot per tab, which its route's page renders. A site replaces or removes a tab by targeting its widget ID in that slot.

Each tab's component is also exported from the package, so another app can show the tab in a slot of its own: it takes the course's IDs as props, and needs nothing from Learning's pages. Its code loads on first render, in the tab's own chunk.

| Widget | ID | Constant | Component | Slot |
|---|---|---|---|---|
| [Outline tab](./OutlineTab/README.md) | `outlineTab` | `outlineTabWidgetId` | `OutlineTab` | [Outline Tab](../slots/OutlineTabSlot/README.md) |
| [Dates tab](./DatesTab/README.md) | `datesTab` | `datesTabWidgetId` | `DatesTab` | [Dates Tab](../slots/DatesTabSlot/README.md) |
| [Progress tab](./ProgressTab/README.md) | `progressTab` | `progressTabWidgetId` | `ProgressTab` | [Progress Tab](../slots/ProgressTabSlot/README.md) |
| [Live tab](./LiveTab/README.md) | `liveTab` | `liveTabWidgetId` | `LiveTab` | [Live Tab](../slots/LiveTabSlot/README.md) |
| [Courseware tab](./CoursewareTab/README.md) | `coursewareTab` | `coursewareTabWidgetId` | `CoursewareTab` | [Courseware Tab](../slots/CoursewareTabSlot/README.md) |

## Shipped, not inserted

A stock site shows none of these. Each is exported from the package as a ready-made slot operation, so enabling one is a line of site config:

```ts
import { courseBreadcrumbsSlotOperation } from '@openedx/frontend-app-learning';
```

| Widget | ID | Operation | Slot |
|---|---|---|---|
| [Course breadcrumbs](./CourseBreadcrumbs/README.md) | `courseBreadcrumbs` (exported as `courseBreadcrumbsWidgetId`) | `courseBreadcrumbsSlotOperation` | [Course Breadcrumbs](../slots/CourseBreadcrumbsSlot/README.md) |
| [Sequence navigation](./SequenceNavigation/README.md) | `sequenceNavigation` | `sequenceNavigationSlotOperation` | [Sequence Navigation](../slots/SequenceNavigationSlot/README.md) |
