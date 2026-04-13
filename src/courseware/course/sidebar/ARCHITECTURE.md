# Sidebar Architecture - Two Sidebar Collaboration System

## Overview

The Learning MFE uses a **two-sidebar system** where a left sidebar (Course Outline) and right sidebar (Discussions / External Widgets) work collaboratively to provide contextual panels to learners.

## Architecture Components

### LEFT SIDEBAR (Course Outline)
- **Location**: Left side of screen, adjacent to course content
- **Component**: `CourseOutlineTray` (rendered via `CourseOutlineSidebarSlot`)
- **Purpose**: Navigation - displays course structure, sequences, and units
- **State Management**: Uses `useCourseOutlineSidebar()` hook
- **ID**: `WIDGETS.COURSE_OUTLINE`
- **Rendering**: Only renders when `currentSidebar === 'COURSE_OUTLINE'`
- **Trigger**: `CourseOutlineTrigger` (separate location in mobile/desktop toolbar)

### RIGHT SIDEBAR (Contextual Panels)
- **Location**: Right side of screen
- **Component**: `Sidebar` (rendered via `RightSidebarSlot`)
- **Purpose**: Contextual tools and information panels
- **State Management**: `SidebarContextProvider` + widget registry system
- **Widgets**:
  - `DISCUSSIONS` (priority 10) — Inline discussions for the current unit
  - External widgets registered via `SIDEBAR_WIDGETS` in `env.config.jsx`
  - Example: `@edx/learning-upsell-widgets` provides the upgrade panel at priority 20
- **Rendering**: Looks up `SIDEBARS[currentSidebar]` from widget registry
- **Triggers**: `SidebarTriggers` component renders all registered widget trigger buttons

## Shared State Coordination

Both sidebars share a **single** `currentSidebar` state variable managed by `SidebarContext`:

```javascript
currentSidebar: '<widget-id>' | 'COURSE_OUTLINE' | null
```

### State Machine

The framework is agnostic about which widgets are registered. The values below use the built-in widgets as examples — `'DISCUSSIONS'` and `'UPGRADE'` have no special meaning to the framework itself.

| `currentSidebar` Value | LEFT Sidebar (Course Outline) | RIGHT Sidebar |
|------------------------|-------------------------------|----------------------------------------|
| `null` | Hidden | Hidden |
| `'DISCUSSIONS'` (example) | Hidden | Shows Discussions panel |
| `'UPGRADE'` (example) | Hidden | Shows that widget's panel |
| `'COURSE_OUTLINE'` | Shows Course Outline | Hidden (not in SIDEBARS registry) |

**Note**: Only one sidebar is active at a time. This reflects current production behaviour, not a product requirement. The single `currentSidebar` state variable is an implementation choice that makes the behaviour consistent and predictable.

## Collaboration Pattern

### Signal: `initialSidebar`

The `initialSidebar` value (calculated by `SidebarContextProvider`) signals whether any RIGHT sidebar panels are available:

- `initialSidebar !== null` → RIGHT sidebar has available panels
- `initialSidebar === null` → NO right sidebar panels available → Course Outline should open as fallback

### Auto-Open Logic

**RIGHT Sidebar (Desktop):**
```javascript
// In SidebarContextProvider
if (shouldDisplaySidebarOpen && !shouldDisplayFullScreen) {
  // Auto-open first available widget (sorted by priority)
  initialSidebar = getFirstAvailablePanel(); // Returns null if none available
}
```

**LEFT Sidebar (Desktop Fallback):**
```javascript
// In useCourseOutlineSidebar hooks
const isOpenSidebar = !initialSidebar && !isCollapsedOutlineSidebar;

useEffect(() => {
  if (isOpenSidebar && currentSidebar !== 'COURSE_OUTLINE') {
    toggleSidebar('COURSE_OUTLINE'); // Opens course outline as fallback
  }
}, [initialSidebar, unitId]);
```

### Priority Cascade (Desktop)

1. **Registered widgets** sorted by `priority` (lower number = higher priority) — opens first available widget
2. **COURSE_OUTLINE** (Fallback) — opens if no right-panel widgets are available for the current unit
For reference, the built-in widget priorities: Discussions = 10, unset = 50 (default).

## Use Case Implementation

### Initial Load (Desktop > 1200px)

| Available Panels | `initialSidebar` | `currentSidebar` | Result |
|-----------------|------------------|------------------|---------|
| Any widget available | `'<widget-id>'` | `'<widget-id>'` | Highest-priority available widget opens |
| No widgets available | `null` | `'COURSE_OUTLINE'` | Course Outline opens (fallback) |


### Initial Load (Mobile < 1200px)

- **Behavior**: NO auto-open, respects `localStorage`
- **localStorage Key**: `sidebar.${courseId}`
- **User Action**: Must manually tap trigger buttons to open panels

### Unit Shift Behaviour (Desktop)

On unit navigation, the framework re-evaluates `getAvailableWidgets()` for the new unit and applies:

- A higher-priority widget becomes available → switch to it
- The current widget is still available → stay
- No widgets available → close right panel, Course Outline auto-opens
- Course Outline was open → switch to first available widget if any

_Example with built-in widgets:_

**Scenario 1: Previous unit had a right-panel widget open**
- New unit has the same widget available → **Stays**
- New unit has a higher-priority widget → **Switches to higher-priority widget**
- New unit has no widgets available → **Closes right panel, Course Outline auto-opens**

**Scenario 2: Previous unit had COURSE_OUTLINE open**
- New unit has any widget available → **Switches to highest-priority widget**
- New unit has no widgets available → **Stays on Course Outline**

### Manual Toggle Behavior

| Action | Current State | Result |
|--------|---------------|--------|
| Click Widget A's trigger | Widget A open | Closes Widget A |
| Click Widget A's trigger | Widget B open | Switches to Widget A |
| Click Widget A's trigger | Course Outline open | Switches to Widget A |
| Click Course Outline trigger | Course Outline open | Closes Course Outline |
| Click Course Outline trigger | Any widget open | Switches to Course Outline |


### Window Resize

- **Mobile → Desktop**: Auto-opens first available RIGHT sidebar panel if any available
- **Desktop → Mobile**: Maintains current state, respects `localStorage`
- **Course Outline on desktop resize**: Properly collapses when switching to mobile

### State Persistence

**localStorage (`sidebar.${courseId}`):**
- Stores last opened sidebar ID (including `'COURSE_OUTLINE'`)
- Used on mobile to restore state
- Used on desktop to restore user preference if still available

**sessionStorage (`hideCourseOutlineSidebar`):**
- Tracks if user manually collapsed Course Outline
- Prevents auto-opening when user explicitly hid it

## Implementation Details

### SidebarContextProvider.jsx

**Responsibilities:**
- Calculate `initialSidebar` based on available RIGHT sidebar panels
- Manage `currentSidebar` state (shared by both sidebars)
- Handle unit shift logic for RIGHT sidebar panels
- Provide context to both left and right sidebar components
- **Prefetch widget data** after mount via `widget.prefetch` (sync logic re-evaluates availability once data arrives)

### Widget Prefetch Lifecycle

Widgets can define a `prefetch` function in their config to pre-load data that their `isAvailable` or render logic depends on. The framework calls `prefetch` for every enabled widget on mount (and when `courseId` or the widget list changes):

```javascript
// In SidebarContextProvider.jsx
const courseMetaRef = useRef(null);
courseMetaRef.current = { ...coursewareMeta, ...courseHomeMeta };

useEffect(() => {
  enabledWidgets.forEach(widget => {
    if (widget.prefetch) {
      widget.prefetch({ courseId, course: courseMetaRef.current, dispatch });
    }
  });
}, [enabledWidgets, courseId, dispatch]);
```

`courseMetaRef` is updated on every render so the effect always reads the latest `coursewareMeta` + `courseHomeMeta` values without `coursewareMeta`/`courseHomeMeta` being reactive dependencies. This means the effect fires once per `courseId` change rather than on every model reference update.

**Why prefetch lives in the provider, not in individual components:**
- Dispatches data loading post-mount so the sync logic can re-evaluate availability once the store updates
- Individual Trigger/Sidebar components can remain pure render components
- Centralises fetch orchestration in one place

**Key Logic:**
```javascript
// When no RIGHT sidebar panels available
if (!firstAvailable) {
  // Only close if currently showing a RIGHT sidebar widget
  // Don't close if showing COURSE_OUTLINE (left sidebar)
  if (currentSidebar && currentSidebar !== WIDGETS.COURSE_OUTLINE) {
    setCurrentSidebar(null);
  }
  // Course outline hooks will detect !initialSidebar and open itself
  return;
}
```

### useCourseOutlineSidebar Hook

**Responsibilities:**
- Detect when RIGHT sidebar has no available panels (`!initialSidebar`)
- Auto-open Course Outline as fallback (unless manually collapsed)
- Handle Course Outline specific interactions (unit clicks, toggle, resize)

**Key Logic:**
```javascript
const isOpenSidebar = !initialSidebar && !isCollapsedOutlineSidebar;

useEffect(() => {
  if (isOpenSidebar && currentSidebar !== ID) {
    toggleSidebar('COURSE_OUTLINE');
  }
}, [initialSidebar, unitId]);
```

### Sidebar.jsx (RIGHT Sidebar Renderer)

**Responsibilities:**
- Render active RIGHT sidebar widget panel
- Return `null` if `currentSidebar` is not in SIDEBARS registry

**Key Logic:**
```javascript
if (!currentSidebar || !SIDEBARS || !SIDEBARS[currentSidebar]) {
  return null; // Handles COURSE_OUTLINE case (not in registry)
}
```

### CourseOutlineTray.jsx (LEFT Sidebar Renderer)

**Responsibilities:**
- Render course outline navigation
- Only show when `currentSidebar === 'COURSE_OUTLINE'`

**Key Logic:**
```javascript
if (isActiveEntranceExam || currentSidebar !== ID) {
  return null;
}
```
