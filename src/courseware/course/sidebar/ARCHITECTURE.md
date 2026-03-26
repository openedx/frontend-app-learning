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
- **Triggers**: `SidebarTriggers` component renders all widget trigger buttons

## Shared State Coordination

Both sidebars share a **single** `currentSidebar` state variable managed by `SidebarContext`:

```javascript
currentSidebar: 'DISCUSSIONS' | 'COURSE_OUTLINE' | null | string
```

### State Machine

| `currentSidebar` Value | LEFT Sidebar (Course Outline) | RIGHT Sidebar (Discussions/Upgrade) |
|------------------------|-------------------------------|-------------------------------------------|
| `null` | Hidden (returns null) | Hidden (returns null) |
| `'DISCUSSIONS'` | Hidden | Shows Discussions panel |
| `'UPGRADE'` | Hidden | Shows Upgrade panel |
| `'COURSE_OUTLINE'` | Shows Course Outline | Hidden (not in SIDEBARS registry) |
| External widget ID | Hidden | Shows external widget panel |

**Key Principle**: Only ONE sidebar can be active at a time. They never overlap.

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
  // Auto-open first available: DISCUSSIONS → UPGRADE → External Widgets
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

1. **DISCUSSIONS** (Priority 10) - Opens if unit has discussions
2. **UPGRADE** (Priority 20) - Opens if no discussions but verified mode exists
3. **External Widgets** (Priority 30+) - Opens if configured and available
4. **COURSE_OUTLINE** (Fallback) - Opens if NO right sidebar panels available

## Use Case Implementation

### Initial Load (Desktop > 1200px)

| Available Panels | `initialSidebar` | `currentSidebar` | Result |
|-----------------|------------------|------------------|---------|
| Discussions available | `'DISCUSSIONS'` | `'DISCUSSIONS'` | Discussions opens |
| Only Upgrade | `'UPGRADE'` | `'UPGRADE'` | Upgrade opens |
| Neither available | `null` | `'COURSE_OUTLINE'` | Course Outline opens (fallback) |

### Initial Load (Mobile < 1200px)

- **Behavior**: NO auto-open, respects `localStorage`
- **localStorage Key**: `sidebar.${courseId}`
- **User Action**: Must manually tap trigger buttons to open panels

### Unit Shift Behavior (Desktop)

**Scenario 1: Previous unit had DISCUSSIONS open**
- New unit has discussions → **Stays on Discussions**
- New unit NO discussions, YES upgrade → **Switches to Upgrade**
- New unit NO discussions, NO upgrade → **Closes right sidebar, Course Outline auto-opens**

**Scenario 2: Previous unit had UPGRADE open**
- New unit has discussions → **Switches to Discussions** (higher priority)
- New unit NO discussions, YES upgrade → **Stays on Upgrade**
- New unit NO discussions, NO upgrade → **Closes right sidebar, Course Outline auto-opens**

**Scenario 3: Previous unit had COURSE_OUTLINE open**
- New unit has discussions → **Switches to Discussions**
- New unit has upgrade → **Switches to Upgrade**
- New unit NO discussions, NO upgrade → **Stays on Course Outline**

**Scenario 4: Previous unit NO panel open**
- New unit has panels → **Auto-opens first available panel**
- New unit NO panels → **Auto-opens Course Outline**

### Manual Toggle Behavior

| Action | Current State | Result |
|--------|---------------|--------|
| Click Discussions trigger | Discussions open | Closes Discussions |
| Click Discussions trigger | Upgrade open | Switches to Discussions |
| Click Discussions trigger | Course Outline open | Switches to Discussions |
| Click Course Outline trigger | Course Outline open | Closes Course Outline |
| Click Course Outline trigger | Discussions open | Switches to Course Outline |

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
