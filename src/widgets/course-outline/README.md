# Course Outline Widget

Left-side collapsible tray that renders the full course outline (sections → sequences → units) alongside the courseware player.

## Overview

Unlike right-sidebar widgets, the course outline is **not** registered in the `SIDEBAR_WIDGETS` config key and does not go through the widget registry. It is rendered directly via plugin slots and its open/closed state is managed separately by the sidebar hooks using the `COURSE_OUTLINE` sentinel ID.

## Plugin Slots

| Slot | Component | Usage |
|------|-----------|-------|
| `CourseOutlineSidebarSlot` | `CourseOutlineTray` | Full tray panel (desktop) |
| `CourseOutlineSidebarTriggerSlot` | `CourseOutlineTrigger` | Trigger button (desktop) |
| `CourseOutlineMobileSidebarTriggerSlot` | `CourseOutlineTrigger` | Trigger button (mobile) |

## Key Behaviours

- Auto-opens on desktop when no right-panel widgets are available for the current unit
- Collapses when window width drops below the Paragon `lg` breakpoint
- Preserves collapsed state in `sessionStorage` (key: `hideCourseOutlineSidebar`)
- Clicking a unit navigates via react-router and fires tracking events
- Hidden while an entrance exam is active

## Exports

| Export | Description |
|--------|-------------|
| `CourseOutlineTray` | Main tray panel component |
| `CourseOutlineTrigger` | Collapse/expand trigger button |
| `ID` | Widget sentinel ID: `'COURSE_OUTLINE'` |
| `useCourseOutlineSidebar` | Hook providing all tray state and handlers |
