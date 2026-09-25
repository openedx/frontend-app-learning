# Sidebar Widget Framework

## Overview

The sidebar uses a pluggable widget framework that allows instances to customize which panels appear in the course sidebar.

Widget implementations:

- **[discussions](../../../widgets/discussions/README.md)** — built-in right-panel; always enabled (in `src/widgets/`)
- **[course-outline](sidebars/course-outline/README.md)** — built-in left-panel (in `sidebar/sidebars/`)

## Architecture

### Widget Structure

Each widget is a `SidebarWidget`, declared in [`SidebarContext.tsx`](SidebarContext.tsx).

### The `Provider` field

An optional component the widget supplies, taking `children`. `SidebarProvider` wraps all children in each registered widget's `Provider` (in reverse-priority order), whether or not the widget is currently available, and the Provider can read `courseId` etc. through `useSidebar()` since it mounts inside the provider. That gives the widget one component that is mounted for as long as the sidebar is, where it can run hooks and hold state that its `Sidebar` and `Trigger` both read. The two built-in widgets use it for the two things it is for:

- **Shared state.** The upgrade widget's `UpgradeWidgetProvider` keeps the seen/unseen status and the upgrade stage in a context of its own, which `UpgradeTrigger` and `UpgradePanel` read.
- **Loading the data `isAvailable` depends on.** A widget's trigger is mounted only once the widget is available, so a fetch the availability check needs cannot live in the trigger. The discussions widget's `DiscussionsProvider` runs one `useQuery`, with the conditions for fetching in `enabled`, and renders its children unchanged. The request goes out once when the sidebar mounts; the first availability check runs before the data arrives, and when the query resolves the framework re-evaluates availability and the trigger appears.

```javascript
// widgets/discussions/DiscussionsProvider.tsx
const DiscussionsProvider = ({ children }) => {
  const { courseId } = useSidebar();
  const tabs = useCourseHomeMeta(courseId, { enabled: false }).data?.tabs;
  useQuery({
    ...discussionTopicsQuery(courseId),
    enabled: !!getConfig().DISCUSSIONS_MFE_BASE_URL && hasDiscussionTab(tabs),
  });
  return <>{children}</>;
};
```

```javascript
// In your widget's widgetConfig.js
export const myWidgetConfig = {
  id: 'MY_WIDGET',
  Sidebar: MyWidgetPanel,
  Trigger: MyWidgetTrigger,
  Provider: MyWidgetProvider,  // optional — omit if the widget has no shared state and no data to load
  isAvailable: ({ course }) => !!course?.someField,
  enabled: true,
};
```

### Context Object

The `isAvailable` function receives a `SidebarWidgetContext`, declared in [`SidebarContext.tsx`](SidebarContext.tsx). Widgets pick whatever they need from its `course` or `unit` — the sidebar makes no assumptions about which fields any given widget requires.

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
import { useIntl } from '@edx/frontend-platform/i18n';
import SidebarBase from '@src/courseware/course/sidebar/common/SidebarBase';
import { useSidebar } from '@src/courseware/course/sidebar/SidebarContext';

export const ID = 'MY_WIDGET';

const MySidebar = () => {
  const intl = useIntl();
  const { courseId } = useSidebar();

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

The widget config functions, `isAvailable` and `prefetch`, are handed course data as their `course` argument (see the context object above). Widget components get no such argument and read course data with the React Query hooks. `{ enabled: false }` makes the hook read the cached result without requesting it, which is right under the courseware page: the page has already fetched both queries. Anywhere else, `.data` stays `undefined` until something on that page fetches the data, for example by calling `useCourseHomeMeta(courseId)` without the option.

```javascript
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';

// In your component
const { verifiedMode, courseModes } = useCourseHomeMeta(courseId, { enabled: false }).data ?? {};
```

Available data:
- `useCourseHomeMeta` (`@src/course-home/data/apiHooks`) - Course home data, staff status, permissions
- `useCoursewareMetadata` (`@src/courseware/data/apiHooks`) - Course metadata, enrollment, verification
- `useDiscussionTopic` (`@src/courseware/data/apiHooks`) - Discussion topic data per unit

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
