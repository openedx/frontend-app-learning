# 10. Extract Upgrade Widget from Core MFE

## Context

The Learning MFE shipped with a built-in upgrade sidebar widget internally named "Notifications". This caused several problems:

1. **Confusing naming**: The "Notifications" label implied platform notification functionality, conflicting with the actual notification tray used elsewhere in the platform.
2. **Core/commercial coupling**: The upgrade widget is a commercial feature specific to paid instances, not part of the Open edX core offering. Yet it was enabled by default for all deployments.
3. **Empty panel problem**: In courses without a paid track, the upgrade panel was empty but still visible, degrading the learner experience.
4. **Tight coupling**: The widget was directly imported and wired into the sidebar, making it difficult to customize or disable without forking the MFE.

## Decision

### 1. Rename "notifications" terminology to "upgrade"

All internal code references to "notification" that specifically relate to the upgrade panel are renamed to "upgrade":

- `WIDGETS.NOTIFICATIONS` → `WIDGETS.UPGRADE`
- `notificationStatus` context property → `upgradeWidgetStatus`
- `onNotificationSeen` → `onUpgradeWidgetSeen`
- `NotificationTray` component → `UpgradePanel`
- `NotificationTrigger` component → `UpgradeTrigger`
- `NotificationIcon` component → `UpgradeIcon`
- localStorage keys: `notificationStatus.${courseId}` → `upgradeWidget.${courseId}`
- i18n message keys (`notification.*`)


### 2. Widget moved to `src/widgets/upgrade/`

Rather than publishing a separate npm package, the widget is kept as a subdirectory of the MFE. This avoids monorepo publishing overhead while maintaining a clean separation from the sidebar framework.

Instances that need the upgrade panel register it via `env.config.jsx`:

```js
import upgradeWidget from './src/widgets/upgrade/src/index';

export const SIDEBAR_WIDGETS = [upgradeWidget];
```
