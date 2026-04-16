# Discussions Widget

Built-in right-sidebar widget that embeds the Discussions MFE in an iframe for the current unit.

## Widget Config

| Field | Value |
|-------|-------|
| `id` | `DISCUSSIONS` |
| `priority` | `10` (highest built-in priority) |
| `isAvailable` | `({ unit }) => !!(unit?.id && unit?.enabledInContext)` |

## Availability

Only shown when the current unit has a discussion topic enabled in context. Both conditions must be true:
- `topic.id` — a discussion topic exists for the unit
- `topic.enabledInContext` — discussions are enabled for this context

## Exports

| Export | Description |
|--------|-------------|
| `discussionsWidgetConfig` | Ready-to-use widget config object |
| `discussionsIsAvailable` | Availability function, usable standalone for custom configs |

## Customising Availability

```javascript
import { discussionsWidgetConfig, discussionsIsAvailable } from '@src/widgets/discussions/widgetConfig';

// In env.config.jsx — override availability with additional logic
const config = {
  SIDEBAR_WIDGETS: [
    {
      ...discussionsWidgetConfig,
      isAvailable: (context) => discussionsIsAvailable(context) && myExtraCondition(context),
    },
  ],
};
```
