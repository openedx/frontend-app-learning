# Learning Upgrade Widget

Optional upgrade sidebar widget for the [Open edX Learning MFE](https://github.com/openedx/frontend-app-learning).

The widget lives in `src/widgets/upgrade/` alongside the other built-in widgets. Instances that need the upgrade panel register it via `env.config.jsx`; instances that don't simply omit it.

> **Future extraction**: If this widget is ever moved to its own repository it can be published as an npm package. The `widgetConfig` shape and `isAvailable` contract are designed to be compatible with that transition.

## Usage

### 1. Register the widget

In your `env.config.jsx`:

```jsx
import { upgradeWidgetConfig } from './src/widgets/upgrade/src/index';

const config = {
  SIDEBAR_WIDGETS: [
    {
      ...upgradeWidgetConfig,
      // Only show in specific courses, or add custom logic
      isAvailable: ({ course, courseId }) =>
        upgradeIsAvailable({ course }) && myCustomCoursePredicate(courseId),
    },
  ],
};
```

### 3. Inject custom upgrade content (optional)

Use the `UpgradePanelSlot` plugin slot (public API, stable ID):

```jsx
import { upgradeWidgetConfig } from './src/widgets/upgrade/src/index';
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import MyCustomUpgradeContent from './MyCustomUpgradeContent';

const config = {
  SIDEBAR_WIDGETS: [upgradeWidgetConfig],
  pluginSlots: {
    'upgrade_panel_slot': {
      plugins: [{
        op: PLUGIN_OPERATIONS.Insert,
        widget: {
          id: 'custom_upgrade_content',
          type: DIRECT_PLUGIN,
          RenderWidget: MyCustomUpgradeContent,
        },
      }],
    },
  },
};
```

## API

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `upgradeWidgetConfig` | Object | Ready-to-use widget config for `SIDEBAR_WIDGETS` |
| `UpgradePanel` | Component | Main panel component |
| `UpgradeTrigger` | Component | Trigger button component |
| `UpgradeIcon` | Component | Icon with optional red-dot badge |
| `upgradeIsAvailable` | Function | Default availability check: `({ course }) => !!course?.verifiedMode` |
| `ID` | String | Widget ID: `'UPGRADE'` |

### Widget config shape

```javascript
{
  id: 'UPGRADE',         // string
  priority: 20,           // number (lower = shown first; discussions = 10)
  Sidebar: UpgradePanel,  // React component
  Trigger: UpgradeTrigger, // React component
  isAvailable: Function,  // ({ course }) => boolean  — receives merged coursewareMeta + courseHomeMeta
  enabled: true,          // boolean
}
```

## Context Requirements

The widget reads `courseId` and `shouldDisplayFullScreen` from the global `SidebarContext`. All other widget-level state (`upgradeWidgetStatus`, `onUpgradeWidgetSeen`, etc.) is managed internally by `UpgradeWidgetContext` — the widget's own Provider — and is never written to `SidebarContext`.

