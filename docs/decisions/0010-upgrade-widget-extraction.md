# 10. Extract Upgrade Widget to External Package

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


### 3. External package `@edx/learning-upgrade-widget` is created

A standalone npm package is created with the same functionality. Instances that need the upgrade panel:

1. Install `@edx/learning-upgrade-widget`
2. Set `ENABLE_LEGACY_UPGRADE_WIDGET: false`
3. Add the package widget to `SIDEBAR_WIDGETS` in `env.config.jsx`

The package skeleton lives in `src/external-widgets/learning-upsell-widget/` until promoted to its own repository.
