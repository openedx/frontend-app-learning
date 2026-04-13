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
| `discussionsPrefetch` | Prefetch function that loads discussion topics into the Redux store |

## Data Prefetch

The widget defines a `prefetch` function in its config. The sidebar framework calls this from `SidebarContextProvider` after mount and when course metadata changes to populate or refresh discussion topics in the Redux store. Because this runs from a `useEffect`, initial render-time checks such as `isAvailable` (and initial sidebar computation) may still occur before the prefetch has completed; the framework's sync logic re-evaluates availability once the store updates:

```javascript
// Conditions checked before fetching:
// 1. DISCUSSIONS_MFE_BASE_URL is configured
// 2. Course has a 'discussion' tab (edxProvider)
```

The `DiscussionsTrigger` component itself is a pure render component — it reads the `discussionTopics` model but does not dispatch any fetches.

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
