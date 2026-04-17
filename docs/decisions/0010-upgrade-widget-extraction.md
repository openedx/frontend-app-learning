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

---

## Migration & Backward Compatibility

The following section documents every renamed identifier, the backward-compatibility shims that were added, and what operators and plugin authors need to know. This inventory is structured so that a future OEP-21 DEPR filer can lift it directly.

### Deprecated Identifiers

| Deprecated | Replacement | Deprecated since | Planned removal |
|-----------|-------------|-----------------|-----------------|
| Plugin slot `org.openedx.frontend.learning.notification_tray.v1` (and `notification_tray_slot`) | `org.openedx.frontend.learning.upgrade_panel.v1` | PR #1899 | TBD — one full deprecation cycle |
| Plugin slot `org.openedx.frontend.learning.notifications_discussions_sidebar.v1` (and `notifications_discussions_sidebar_slot`) | `org.openedx.frontend.learning.right_sidebar.v1` / `right_sidebar_slot` | PR #1899 | TBD |
| Plugin slot `org.openedx.frontend.learning.notifications_discussions_sidebar_trigger.v1` (and `notifications_discussions_sidebar_trigger_slot`) | `org.openedx.frontend.learning.right_sidebar_trigger.v1` / `right_sidebar_trigger_slot` | PR #1899 | TBD |
| `pluginProps` keys `notificationCurrentState` / `setNotificationCurrentState` on the upgrade panel slot | `upgradeCurrentState` / `setUpgradeCurrentState` | PR #1899 | TBD |
| `WIDGETS.NOTIFICATIONS` (value changed from `'NOTIFICATIONS'` to `'UPGRADE'`) | `ID` exported from `@src/widgets/upgrade/src` | PR #1899 | TBD |

### Default-Behavior Change

`upgradeWidgetConfig` is currently included in `DEFAULT_WIDGETS`. A future release will remove it, after which operators who want the Upgrade panel visible must add it to `SIDEBAR_WIDGETS` in `env.config.jsx`. Target release: TBD.

---

### 1. Plugin Slot IDs

#### Sidebar panel slot

| Old ID (deprecated) | New ID |
|---------------------|--------|
| `org.openedx.frontend.learning.notification_tray.v1` | `org.openedx.frontend.learning.upgrade_panel.v1` |
| `notification_tray_slot` _(short alias)_ | — _(use the full ID)_ |

Both old IDs are preserved as `idAliases` on the new slot — **existing plugin configs
continue to work without changes**. They are deprecated and will be removed in a future
major version.

#### Right sidebar slot

| Old ID (deprecated) | New ID |
|---------------------|--------|
| `org.openedx.frontend.learning.notifications_discussions_sidebar.v1` | `org.openedx.frontend.learning.right_sidebar.v1` |
| `notifications_discussions_sidebar_slot` _(short alias)_ | `right_sidebar_slot` _(short alias)_ |

#### Right sidebar trigger slot

| Old ID (deprecated) | New ID |
|---------------------|--------|
| `org.openedx.frontend.learning.notifications_discussions_sidebar_trigger.v1` | `org.openedx.frontend.learning.right_sidebar_trigger.v1` |
| `notifications_discussions_sidebar_trigger_slot` _(short alias)_ | `right_sidebar_trigger_slot` _(short alias)_ |

---

### 2. Plugin Props — Upgrade Panel Slot

Plugins injected into the upgrade panel slot received props renamed in ADR 0010.
Both old and new names are available as `pluginProps` for backward compatibility:

| Old prop _(deprecated)_ | New prop |
|--------------------------|----------|
| `notificationCurrentState` | `upgradeCurrentState` |
| `setNotificationCurrentState` | `setUpgradeCurrentState` |

Update your plugin to use the new prop names. The old aliases will be removed in a future
major version.

---

### 3. JavaScript Constants

`WIDGETS.NOTIFICATIONS` previously held the value `'NOTIFICATIONS'` to match the old widget ID.
After ADR 0010 it holds `'UPGRADE'`, so existing comparisons like
`currentSidebar === WIDGETS.NOTIFICATIONS` continue to resolve correctly against the
renamed widget. The constant itself is **deprecated** — update new code to use the widget's
own `ID` constant:

```js
// Before ADR 0010
import { WIDGETS } from '@src/constants';
WIDGETS.NOTIFICATIONS // === 'NOTIFICATIONS'

// After ADR 0010 (current)
WIDGETS.NOTIFICATIONS // === 'UPGRADE' — deprecated alias, value changed

// Recommended for new code
import { ID as UPGRADE_WIDGET_ID } from '@src/widgets/upgrade/src/UpgradeTrigger';
// or
import { ID } from '@src/widgets/upgrade/src';

if (currentSidebar === ID) { /* ... */ }
```

---

### 4. Context API Renames

If your code consumed the old React context properties directly (e.g. via a custom hook
wrapping `SidebarContext` or `UpgradeWidgetContext`), update the following names:

| Old name _(deprecated)_ | New name |
|--------------------------|----------|
| `notificationStatus` | `upgradeWidgetStatus` |
| `setNotificationStatus` | `setUpgradeWidgetStatus` |
| `onNotificationSeen` | `onUpgradeWidgetSeen` |
| `notificationCurrentState` | `upgradeCurrentState` |
| `setNotificationCurrentState` | `setUpgradeCurrentState` |

Access upgrade widget context via:

```js
import { useUpgradeWidgetContext } from '@src/widgets/upgrade/src';

const { upgradeWidgetStatus, onUpgradeWidgetSeen, upgradeCurrentState } = useUpgradeWidgetContext();
```

---

### 5. localStorage Keys

The persistent status keys for the upgrade widget were renamed. Old keys stored in a
learner's browser are **not** migrated automatically — the first page load after upgrading
will reset the relevant state until the learner interacts with the panel again.

| Old key _(deprecated)_ | New key |
|------------------------|---------|
| `notificationStatus.${courseId}` | `upgradeWidget.${courseId}` |
| `upgradeNotificationLastSeen.${courseId}` | `upgradeWidgetLastSeen.${courseId}` |
| `upgradeNotificationCurrentState.${courseId}` | `upgradeWidgetState.${courseId}` |

---

### 6. `env.config.jsx` Configuration

- **Today:** You do not need to configure the Upgrade widget — it is included by default. If you add it to `SIDEBAR_WIDGETS`, the platform will ignore the duplicate and only show the default.
- **In the future:** You will need to add it to `SIDEBAR_WIDGETS` to keep the Upgrade panel visible.
- You can safely add `upgradeWidgetConfig` to `SIDEBAR_WIDGETS` now to future-proof your config. It will only take effect once the default is removed.

**To enable the Upgrade panel (future-proof):**

```js
import { upgradeWidgetConfig } from './src/widgets/upgrade/src';
export default {
  SIDEBAR_WIDGETS: [upgradeWidgetConfig],
};
```

**To disable the Upgrade panel (once it is no longer a default):**

Simply do not include `upgradeWidgetConfig` in your `SIDEBAR_WIDGETS`.
