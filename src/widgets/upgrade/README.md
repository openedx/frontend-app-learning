# Learning Upgrade Widget

Built-in upgrade sidebar widget for the [Open edX Learning MFE](https://github.com/openedx/frontend-app-learning).

The widget lives in `src/widgets/upgrade/` alongside the other built-in widgets. It is currently included in `DEFAULT_WIDGETS` and enabled by default. Its availability check only displays it for courses with a verified mode.

> **Future extraction**: If this widget is ever moved to its own repository it can be published as an npm package. The `widgetConfig` shape and `isAvailable` contract are designed to be compatible with that transition.

## Usage

### Default behavior

No `SIDEBAR_WIDGETS` configuration is required to enable the Upgrade widget. Adding `upgradeWidgetConfig` to `SIDEBAR_WIDGETS` while it remains a default is safe, but the duplicate entry is ignored in favor of the default configuration.

### Disable the widget

Add a disabled entry with the Upgrade widget's ID to `env.config.jsx`:

```jsx
export default {
  SIDEBAR_WIDGETS: [{ id: 'UPGRADE', enabled: false }],
};
```

### Explicit registration for future default removal (optional)

The Upgrade widget is expected to be removed from `DEFAULT_WIDGETS` in a future release. Instances that want to retain it after that change can register it explicitly now. The entry will be ignored as a duplicate until the default is removed.

In your `env.config.jsx`:

```jsx
import { upgradeWidgetConfig } from './src/widgets/upgrade/src/index';

export default {
  SIDEBAR_WIDGETS: [upgradeWidgetConfig],
};
```

See [ADR 0010](../../../docs/decisions/0010-upgrade-widget-extraction.md) for the default-behavior migration plan.

### Inject custom upgrade content (optional)

Use the Upgrade Panel plugin slot's stable ID:

```jsx
import { PLUGIN_OPERATIONS, DIRECT_PLUGIN } from '@openedx/frontend-plugin-framework';
import MyCustomUpgradeContent from './MyCustomUpgradeContent';

const config = {
  pluginSlots: {
    'org.openedx.frontend.learning.upgrade_panel.v1': {
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

export default config;
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
