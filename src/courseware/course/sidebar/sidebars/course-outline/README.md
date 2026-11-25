# Course Outline Widget

Left-side collapsible tray that renders the full course outline (sections → sequences → units) alongside the courseware player.

## Overview

Unlike the auxiliary sidebar's widgets, the course outline is **not** one of the sidebar provider's widgets and does not go through the widget registry. It is rendered directly via slots and its open/closed state is managed separately by the sidebar hooks using the `COURSE_OUTLINE` sentinel ID.

## Slots

| Slot | Default content | Usage |
|------|-----------|-------|
| `CourseOutlineSidebarSlot` | `CourseOutlineTray` | Full tray panel |
| `CourseOutlineSidebarTriggerSlot` | `CourseOutlineTrigger` | Trigger button (desktop) |
| `CourseOutlineMobileSidebarTriggerSlot` | `CourseOutlineTrigger` | Trigger button (mobile) |
| `CourseOutlineSidebarHeadingSlot` | `CourseOutlineHeading` | The tray's heading |
| `CourseOutlineSidebarCompletionIconSlot` | `CompletionIcon` | Each section and sequence row's completion icon |
| `CourseOutlineSidebarUnitSlot` | `SidebarUnitContent` | Each unit row's contents |

Each is documented in its directory under `src/slots/`.

## Key Behaviours

- Auto-opens on desktop when no right-panel widgets are available for the current unit
- Collapses when window width drops below the Paragon `lg` breakpoint
- Closed state persists across navigation via the shared `sidebarClosedByUser` sessionStorage flag managed by `SidebarProvider`
- Clicking a unit navigates via react-router and fires tracking events
- Hidden while an entrance exam is active

## Module exports

These are internal to Learning: the package exports none of them. From this directory it exports only `CompletionIcon`, the completion icon slot's default content.

| Export | Description |
|--------|-------------|
| `CourseOutlineTray` | Main tray panel component |
| `CourseOutlineTrigger` | Collapse/expand trigger button |
| `ID` | Widget sentinel ID: `'COURSE_OUTLINE'` |
| `useCourseOutlineSidebar` | Hook providing all tray state and handlers |
