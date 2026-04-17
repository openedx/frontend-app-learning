
# Upgrade Widget — Migration & Deprecation Guide

This guide explains how the sidebar "Upgrade" widget (formerly "Notifications") works today, what will change in the future, and how operators should prepare.

---

## Deprecation Plan (What You Need to Know)

**Current (as of April 2026):**

- The Upgrade panel is enabled by default for all deployments. You do **not** need to add it to your `env.config.jsx` — it is always present unless you override the widget registry.

**Future (deprecation planned):**

- The Upgrade panel will **no longer be enabled by default** in a future release. Operators who want to show the Upgrade panel will need to explicitly add it to their `SIDEBAR_WIDGETS` in `env.config.jsx`.
- This change will be announced in release notes and this document will be updated. The widget will be removed from the default registry after a deprecation period.

**Action for Operators:**

- If you rely on the Upgrade panel, you do not need to do anything right now.
- To future-proof your configuration, you may add the Upgrade widget to your `SIDEBAR_WIDGETS` now. This is safe — the only caveat is that if you add it while it is still a default, you will see two Upgrade tabs (see below for how to avoid this).

---

## Quick Reference: How to Enable or Disable the Upgrade Panel

**To enable the Upgrade panel (future-proof):**

```js
import { upgradeWidgetConfig } from './src/widgets/upgrade/src';
export default {
  SIDEBAR_WIDGETS: [upgradeWidgetConfig],
};
```

**To disable the Upgrade panel (once it is no longer a default):**

- Simply do not include `upgradeWidgetConfig` in your `SIDEBAR_WIDGETS`.

**Important:**

- As of April 2026, the platform will **ignore** any external `upgradeWidgetConfig` in `SIDEBAR_WIDGETS` if it is already present as a platform default. You will not see duplicate tabs or React key warnings. The platform default always takes priority.
- When the Upgrade panel is no longer a default, you will need to add it to `SIDEBAR_WIDGETS` to keep it visible.

---

## Background

Prior to ADR 0010, the sidebar contained a built-in _Notifications_ panel that displayed an upsell prompt for paid enrolment. The name was a misnomer (it was never a general notification centre) and the panel was hard-coded into the core MFE, forcing all Open edX deployments to bundle commercial code they may not need.

ADR 0010 made three changes:

1. **Renamed** all "notification" identifiers to "upgrade".
2. **Moved** the widget to `src/widgets/upgrade/` as a self-contained subdirectory.
3. **Kept it bundled** as a default widget (`DEFAULT_WIDGETS`) so existing deployments continue to see it without configuration changes — but operators can now override or extend it using the standard widget registry.

---

## 1. Plugin Slot IDs

### Sidebar panel slot

| Old ID (deprecated) | New ID |
|---------------------|--------|
| `org.openedx.frontend.learning.notification_tray.v1` | `org.openedx.frontend.learning.upgrade_panel.v1` |
| `notification_tray_slot` _(short alias)_ | — _(use the full ID)_ |

Both old IDs are preserved as `idAliases` on the new slot — **existing plugin configs
continue to work without changes**. They are deprecated and will be removed in a future
major version.

### Right sidebar slot

| Old ID (deprecated) | New ID |
|---------------------|--------|
| `org.openedx.frontend.learning.notifications_discussions_sidebar.v1` | `org.openedx.frontend.learning.right_sidebar.v1` |
| `notifications_discussions_sidebar_slot` _(short alias)_ | `right_sidebar_slot` _(short alias)_ |

### Right sidebar trigger slot

| Old ID (deprecated) | New ID |
|---------------------|--------|
| `org.openedx.frontend.learning.notifications_discussions_sidebar_trigger.v1` | `org.openedx.frontend.learning.right_sidebar_trigger.v1` |
| `notifications_discussions_sidebar_trigger_slot` _(short alias)_ | `right_sidebar_trigger_slot` _(short alias)_ |

---

## 2. Plugin Props — Upgrade Panel Slot

Plugins injected into the upgrade panel slot received props renamed in ADR 0010.
Both old and new names are available as `pluginProps` for backward compatibility:

| Old prop _(deprecated)_ | New prop |
|--------------------------|----------|
| `notificationCurrentState` | `upgradeCurrentState` |
| `setNotificationCurrentState` | `setUpgradeCurrentState` |

Update your plugin to use the new prop names. The old aliases will be removed in a future
major version.

---

## 3. JavaScript Constants

### `WIDGETS.NOTIFICATIONS` → `WIDGETS.NOTIFICATIONS` (deprecated alias)

```js
// Before ADR 0010
import { WIDGETS } from '@src/constants';
WIDGETS.NOTIFICATIONS // === 'NOTIFICATIONS' — matched the old widget ID

// After ADR 0010 (current)
WIDGETS.NOTIFICATIONS // === 'UPGRADE' — aliased to new widget ID for backward compat
```

`WIDGETS.NOTIFICATIONS` is **deprecated** and kept only so that existing checks like
`currentSidebar === WIDGETS.NOTIFICATIONS` continue to resolve correctly against the
renamed widget. Update your code to use the upgrade widget's `ID` constant directly:

```js
import { ID as UPGRADE_WIDGET_ID } from '@src/widgets/upgrade/src/UpgradeTrigger';
// or
import { ID } from '@src/widgets/upgrade/src';

if (currentSidebar === ID) { /* ... */ }
```

---

## 4. Context API Renames

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

## 5. localStorage Keys

The persistent status keys for the upgrade widget were renamed. Old keys stored in a
learner's browser are **not** migrated automatically — the first page load after upgrading
will default the indicator dot back to `active` until the learner views the panel again.

| Old key _(deprecated)_ | New key |
|------------------------|---------|
| `notificationStatus.${courseId}` | `upgradeWidget.${courseId}` |

---


## 6. `env.config.jsx` Configuration (Summary)

- **Today:** You do not need to configure the Upgrade widget — it is included by default. If you add it to `SIDEBAR_WIDGETS`, the platform will ignore the duplicate and only show the default.
- **In the future:** You will need to add it to `SIDEBAR_WIDGETS` to keep the Upgrade panel visible.
- You can safely add `upgradeWidgetConfig` to `SIDEBAR_WIDGETS` now to future-proof your config. It will only take effect once the default is removed.

See the Quick Reference above for copy-paste config examples.

---

## 7. Architectural Notes for Custom Widgets

If you are building a custom sidebar widget that previously used the `WIDGETS.NOTIFICATIONS`
ID, declare your own `ID` constant in your widget's trigger file:

```js
// src/widgets/my-widget/src/MyTrigger.jsx
export const ID = 'MY_WIDGET'; // must be unique across all registered widgets
```

Widget IDs are arbitrary strings. The sidebar framework has no hardcoded knowledge of any
widget ID other than `WIDGETS.COURSE_OUTLINE` (used for the left-sidebar fallback).

---

## Summary of Deprecated Identifiers

| Category | Deprecated | Replacement | Removed? |
|----------|-----------|-------------|----------|
| Plugin slot | `org.openedx.frontend.learning.notification_tray.v1` | `upgrade_panel.v1` | No (aliased) |
| Plugin slot | `notification_tray_slot` | — | No (aliased) |
| Plugin slot | `notifications_discussions_sidebar.v1` | `right_sidebar.v1` | No (aliased) |
| Plugin slot | `notifications_discussions_sidebar_slot` | `right_sidebar_slot` | No (aliased) |
| Plugin slot | `notifications_discussions_sidebar_trigger.v1` | `right_sidebar_trigger.v1` | No (aliased) |
| Plugin slot | `notifications_discussions_sidebar_trigger_slot` | `right_sidebar_trigger_slot` | No (aliased) |
| JS constant | `WIDGETS.NOTIFICATIONS` | `ID` from upgrade widget | No (deprecated alias, value = `'UPGRADE'`) |
| Context prop | `notificationStatus` | `upgradeWidgetStatus` | No (use new name) |
| Context prop | `onNotificationSeen` | `onUpgradeWidgetSeen` | No (use new name) |
| localStorage key | `notificationStatus.${courseId}` | `upgradeWidget.${courseId}` | Not migrated |
| `env.config.jsx` | `SIDEBAR_WIDGETS: [upgradeWidgetConfig]` | Not needed (widget is a default) | — |
