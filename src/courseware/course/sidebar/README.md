# Sidebar Widget Framework

## Overview

The sidebar uses a pluggable widget framework that allows instances to customize which panels appear in the course sidebar.

Widget implementations:

- **[discussions](../../../widgets/discussions/README.md)** — built-in right-panel; always enabled (in `src/widgets/`)
- **[course-outline](sidebars/course-outline/README.md)** — built-in left-panel (in `sidebar/sidebars/`)

## Architecture

### Widget Structure

Each widget must provide:

```javascript
{
  id: string,                         // Unique identifier (e.g., 'DISCUSSIONS', 'CUSTOM_TOOL')
  priority: number,                   // Display order (lower = first, default: 50)
  Sidebar: ReactComponent,            // Main panel component
  Trigger: ReactComponent,            // Trigger button component
  isAvailable: (context) => boolean,  // Optional: check if widget should be shown
  prefetch: ({ courseId, course, dispatch }) => void, // Optional: pre-load data (runs post-mount; sync logic re-evaluates availability)
  enabled: boolean,                   // Whether widget is enabled
  Provider?: ReactComponent,          // Optional: React Provider for Panel↔Trigger shared state
}
```

### The `Provider` field

An optional hook point for widgets that need to share React state between their `Sidebar` and `Trigger` components. The widget owns the full Provider implementation. The framework simply mounts it.

`SidebarContextProvider` wraps all children in each registered widget's `Provider` (in reverse-priority order), so both components have access to the same widget-level context. The Provider itself can safely read `courseId` etc. from `SidebarContext` since it mounts inside it.

No built-in widgets use this field — it exists as a generic extension point for custom widgets that need cross-component coordination without polluting `SidebarContext`.

```javascript
// In your widget's widgetConfig.js
export const myWidgetConfig = {
  id: 'MY_WIDGET',
  Sidebar: MyWidgetPanel,
  Trigger: MyWidgetTrigger,
  Provider: MyWidgetProvider,  // optional — omit if Sidebar/Trigger don't share state
  isAvailable: ({ course }) => !!course?.someField,
  enabled: true,
};
```

### The `prefetch` field

An optional function called by `SidebarContextProvider` after mount (and when `courseId` or the widget list changes). Use it to dispatch Redux thunks or fetch data that `isAvailable`, `Trigger`, or `Sidebar` depend on. The `course` argument always reflects the latest `coursewareMeta` + `courseHomeMeta` values at the time the effect fires. Because this runs post-mount, it does not guarantee the data is present for the initial render-time availability check; widgets that depend on prefetched data may become available after the store updates and the framework sync logic re-evaluates availability.

```javascript
export const myWidgetPrefetch = ({ courseId, course, dispatch }) => {
  if (course?.someCondition) {
    dispatch(fetchMyWidgetData(courseId));
  }
};

export const myWidgetConfig = {
  id: 'MY_WIDGET',
  // ...
  prefetch: myWidgetPrefetch,
};
```

The `course` object is a merged view of `coursewareMeta` and `courseHomeMeta` models.

### Context Object

The `isAvailable` function receives a context object with:

```javascript
{
  courseId: string,
  unitId: string,
  course: object,  // Merged coursewareMeta + courseHomeMeta (verifiedMode, enrollmentMode, courseModes, …)
  unit: object,    // discussionTopics model for the current unit (id, enabledInContext, …)
}
```

Widgets pick whatever they need from `course` or `unit` — the sidebar makes no assumptions about which fields any given widget requires.

## Adding Widgets

Widgets are registered via the `SIDEBAR_WIDGETS` key in `env.config.jsx`. Any object conforming to the widget structure above can be registered.

### Method 1: In-repo widget subdirectory (default approach)

The widget lives in `src/widgets/<name>/` alongside the built-in widgets.

1. **Create your widget directory** with a `widgetConfig.js` following the widget structure above.

2. **Register it in `env.config.jsx`**:
   ```javascript
   import { myWidgetConfig } from './src/widgets/my-widget/widgetConfig';

   export default {
     SIDEBAR_WIDGETS: [myWidgetConfig],
   };
   ```

   _See [`src/widgets/upgrade/`](../../../widgets/upgrade/) for a real example of this pattern._

### Method 2: Via npm package

If the widget lives in a separate repository, install it as a dependency and import it the same way:

```javascript
import { myWidgetConfig } from '@your-org/custom-sidebar-widget';

export default {
  SIDEBAR_WIDGETS: [myWidgetConfig],
};
```

## Widget Component Requirements

### Sidebar Component

The main panel component that renders when the widget is active. Wrap your content in `SidebarBase` to get the standard close button, fullscreen handling, and show/hide behaviour:

```javascript
import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import SidebarBase from '@src/courseware/course/sidebar/common/SidebarBase';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';

export const ID = 'MY_WIDGET';

const MySidebar = () => {
  const intl = useIntl();
  const { courseId } = useContext(SidebarContext);

  return (
    <SidebarBase
      title="My Widget"
      ariaLabel="My Widget panel"
      sidebarId={ID}
      width="31rem"
    >
      {/* Your panel content */}
    </SidebarBase>
  );
};

export default MySidebar;
```

### Trigger Component

The button that appears in the toolbar to open the widget. Use `SidebarTriggerBase` for consistent styling across all widgets:

```javascript
import { Icon } from '@openedx/paragon';
import { MyIcon } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';
import SidebarTriggerBase from '@src/courseware/course/sidebar/common/TriggerBase';

const MyTrigger = ({ onClick }) => (
  <SidebarTriggerBase onClick={onClick} ariaLabel="Open My Widget">
    <Icon src={MyIcon} className="m-0 m-auto" />
  </SidebarTriggerBase>
);

MyTrigger.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default MyTrigger;
```

The `onClick` prop is injected by the framework — your trigger does not need to call `toggleSidebar` directly.

## Accessing Course Data

Widgets can access course data via the model store:

```javascript
import { useModel } from '@src/generic/model-store';

// In your component
const courseData = useModel('coursewareMeta', courseId);
const { verifiedMode, enrollmentMode } = courseData;
```

Available models:
- `coursewareMeta` - Course metadata, enrollment, verification
- `courseHomeMeta` - Course home data, staff status, permissions
- `discussionTopics` - Discussion topic data per unit

## Examples

### Example 1: LTI Tool Widget

```javascript
// In env.config.jsx
import LTIToolWidget from '@edx/lti-tool-sidebar';

const config = {
  SIDEBAR_WIDGETS: [
    {
      id: 'LTI_TOOL',
      priority: 25,
      Sidebar: LTIToolWidget,
      Trigger: LTIToolWidget.Trigger,
      isAvailable: ({ courseId }) => {
        // Only show in specific courses
        return ['course-v1:edX+Demo+2024'].includes(courseId);
      },
      enabled: true,
    },
  ],
};
```

### Example 2: Conditional Widget

```javascript
const config = {
  SIDEBAR_WIDGETS: [
    {
      id: 'PREMIUM_CONTENT',
      priority: 15,
      Sidebar: PremiumContentWidget,
      Trigger: PremiumContentWidget.Trigger,
      isAvailable: ({ course, courseId }) => {
        // Only show to learners with a verified mode available
        return !!course?.verifiedMode?.access_expiration_date;
      },
      enabled: true,
    },
  ],
};
```

## Best Practices

1. **Priority**: Space priorities by 10 to allow insertions (10, 20, 30 vs 1, 2, 3)
2. **Availability**: Always provide `isAvailable` to avoid showing empty widgets
3. **Performance**: Keep `isAvailable` checks lightweight - no API calls
4. **Styling**: Use Paragon components for consistency
5. **Accessibility**: Ensure triggers have proper aria-labels
6. **Error Handling**: Handle missing data gracefully

## Troubleshooting

**Widget not appearing?**
- Check `enabled: true` in configuration
- Verify `isAvailable()` returns true for your context
- Check console for deprecation warnings
- Verify components are exported correctly

**Multiple widgets conflicting?**
- Adjust priorities to control order
- Only one widget can be active at a time
- Check SIDEBAR_ORDER in React DevTools

**Upsell widget not appearing?**
- Ensure `@edx/learning-upsell-widgets` is installed and `SIDEBAR_WIDGETS` is configured
- Verify `verifiedMode` is available in the course context

---

## Production Deployment

### Pre-Deployment Checklist

**Configuration Review**
- Verify `SIDEBAR_WIDGETS` array in `env.config.jsx`
- Test widget availability logic with production data

**Widget Verification**
- All external widgets installed and compatible
- `isAvailable()` functions tested with edge cases
- Priority order produces expected behavior
