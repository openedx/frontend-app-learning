# Sidebar Widget Framework

## Overview

The sidebar uses a pluggable widget framework that allows instances to customise which panels appear in the course sidebar. All widgets are external — none are bundled into the core Learning MFE by default (except Discussions).

- **Built-in widget**: Discussions (always enabled)
- **External widgets**: Installed via npm packages and configured in `env.config.jsx`
  - Upgrade/upsell panel: `@edx/learning-upsell-widgets`

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
  enabled: boolean,                   // Whether widget is enabled
  Provider?: ReactComponent,          // Optional: React Provider for Panel↔Trigger shared state
}
```

### The `Provider` field

When a widget's Panel and Trigger components need to share React state (e.g. badge visibility),
use the optional `Provider` field instead of putting that state in `SidebarContext`.

The `SidebarContextProvider` automatically wraps all children in each registered widget's
`Provider` (in priority order), so both Panel and Trigger have access to the same widget-level
context. The widget Provider itself can safely read `courseId` etc from `SidebarContext` since
it mounts inside it.

Example (from `@edx/learning-upsell-widgets`):

```javascript
// widgetConfig.js
export const upsellWidgetConfig = {
  id: 'UPSELL',
  priority: 20,
  Sidebar: UpsellPanel,
  Trigger: UpsellTrigger,
  Provider: UpsellWidgetProvider,  // <-- provides badge state to both Panel and Trigger
  isAvailable: ({ verifiedMode }) => !!verifiedMode,
  enabled: true,
};
```

### Context Object

The `isAvailable` function receives a context object with:

```javascript
{
  courseId: string,
  unitId: string,
  topic: object,        // Discussion topic data from model store
  verifiedMode: object, // Verification/upgrade data from model store
}
```

## Built-in Widgets

### Discussions (Core)

- **ID**: `DISCUSSIONS`
- **Priority**: 10
- **Status**: Always enabled
- **Availability**: Only shows if a discussion topic exists for the unit

> **Note**: The `UPSELL` / upgrade widget is no longer built-in as of v3.0.
> Install `@edx/learning-upsell-widgets` and add `upsellWidgetConfig` to `SIDEBAR_WIDGETS`
> in your `env.config.jsx` to restore upgrade panel functionality.

## Adding External Widgets

### Method 1: Via npm Package (Recommended)

1. **Install the widget package**:
   ```bash
   npm install @your-org/custom-sidebar-widget
   ```

2. **Configure in `env.config.jsx`**:
   ```javascript
   import CustomWidget from '@your-org/custom-sidebar-widget';

   const config = {
     SIDEBAR_WIDGETS: [
       {
         id: 'CUSTOM_TOOL',
         priority: 30,
         Sidebar: CustomWidget.Sidebar,
         Trigger: CustomWidget.Trigger,
         isAvailable: (context) => {
           // Your availability logic
           return context.courseId && someCondition;
         },
         enabled: true,
       },
     ],
   };
   ```

### Method 2: Via Plugin Slots (For complex integrations)

Use the plugin slot framework to inject widgets:

```javascript
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'sidebar.widget.slot.v1': {
      plugins: [{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'my_custom_widget',
          type: DIRECT_PLUGIN,
          RenderWidget: MyCustomSidebarWidget,
        },
      }],
    },
  },
};
```

## Widget Component Requirements

### Sidebar Component

The main panel component that renders when the widget is active:

```javascript
import { useContext } from 'react';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import { useModel } from '@src/generic/model-store';

const MySidebar = () => {
  const { courseId, unitId, toggleSidebar } = useContext(SidebarContext);
  const courseData = useModel('coursewareMeta', courseId);

  return (
    <div className="sidebar-panel">
      {/* Your panel content */}
    </div>
  );
};
```

### Trigger Component

The button that appears in the header to toggle the widget:

```javascript
const MyTrigger = ({ onClick }) => (
  <button
    type="button"
    className="btn btn-icon"
    onClick={onClick}
    aria-label="Toggle My Widget"
  >
    <Icon src={MyIcon} />
  </button>
);
```

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
      isAvailable: ({ verifiedMode, courseId }) => {
        // Only show to verified learners
        return verifiedMode && verifiedMode.access_expiration_date;
      },
      enabled: true,
    },
  ],
};
```

## Upsell Widget

The upsell upgrade widget is no longer built-in. Operators who want upgrade prompts
must install the external package:

1. **Install**:
   ```bash
   npm install @edx/learning-upsell-widgets
   ```

2. **Configure in env.config.jsx**:
   ```javascript
   import { upsellWidgetConfig } from '@edx/learning-upsell-widgets';

   const config = {
     SIDEBAR_WIDGETS: [upsellWidgetConfig],
   };
   ```

## Testing Widgets

When testing widgets:

```javascript
import { render } from '@testing-library/react';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';

test('renders custom widget', () => {
  const contextValue = {
    courseId: 'course-v1:test',
    unitId: 'block-v1:test',
    currentSidebar: 'MY_WIDGET',
    toggleSidebar: jest.fn(),
  };

  render(
    <SidebarContext.Provider value={contextValue}>
      <MyWidget />
    </SidebarContext.Provider>
  );

  // Your assertions
});
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
