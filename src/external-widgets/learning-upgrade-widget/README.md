# @edx/learning-upgrade-widget

Upgrade sidebar widget for the [Open edX Learning MFE](https://github.com/openedx/frontend-app-learning).

This package extracts the built-in upgrade panel (formerly "Notifications") from the Learning MFE so that instances who need it can install it explicitly, while the community gets a clean default experience without an upgrade panel.

## Installation

```bash
npm install @edx/learning-upgrade-widget
```

## Usage

### 1. Register the widget

In your `env.config.jsx`:

```jsx
import { upgradeWidgetConfig } from '@edx/learning-upgrade-widget';

const config = {
  SIDEBAR_WIDGETS: [upgradeWidgetConfig],
};

export default config;
```

### 2. Customize availability (optional)

```jsx
import { upgradeWidgetConfig, upgradeIsAvailable } from '@edx/learning-upgrade-widget';

const config = {
  SIDEBAR_WIDGETS: [
    {
      ...upgradeWidgetConfig,
      // Only show in specific courses, or add custom logic
      isAvailable: ({ verifiedMode, courseId }) =>
        upgradeIsAvailable({ verifiedMode }) && myCustomCoursePredicate(courseId),
    },
  ],
};
```

### 3. Inject custom upgrade content (optional)

Use the `UpgradePanelSlot` plugin slot (public API, stable ID):

```jsx
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
| `upgradeIsAvailable` | Function | Default availability check `({ verifiedMode }) => boolean` |
| `ID` | String | Widget ID: `'UPGRADE'` |

### Widget config shape

```javascript
{
  id: 'UPGRADE',         // string
  priority: 20,           // number (lower = shown first; discussions = 10)
  Sidebar: UpgradePanel,  // React component
  Trigger: UpgradeTrigger, // React component
  isAvailable: Function,  // ({ courseId, unitId, verifiedMode, topic }) => boolean
  enabled: true,          // boolean
}
```

## Context Requirements

Works via the Learning MFE `SidebarContext`. The following context values are used:

| Property | Type | Description |
|----------|------|-------------|
| `courseId` | string | Current course ID |
| `onUpgradeWidgetSeen` | () => void | Called after 3s to hide red dot |
| `upgradeWidgetStatus` | string\|null | `'active'` or `'inactive'` |
| `setUpgradeWidgetStatus` | (status) => void | Update status |
| `upgradeNotificationCurrentState` | string\|null | Current upgrade stage |
| `setUpgradeNotificationCurrentState` | (state) => void | Update stage |
| `shouldDisplayFullScreen` | boolean | Mobile view flag |

## Peer Dependencies

- `@edx/frontend-platform` >= 8.0.0
- `@openedx/frontend-plugin-framework` >= 2.0.0
- `@openedx/paragon` >= 21.0.0
- `react` >= 18.0.0
- `react-intl` >= 6.0.0
