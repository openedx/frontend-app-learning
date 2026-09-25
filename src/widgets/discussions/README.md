# Discussions Widget

Built-in right-sidebar widget that embeds the Discussions MFE in an iframe for the current unit.

## Widget Config

| Field | Value |
|-------|-------|
| `id` | `DISCUSSIONS` |
| `priority` | `10` (highest built-in priority) |
| `isAvailable` | `({ unit }) => !!(unit?.id && unit?.enabledInContext)` |
| `Provider` | `DiscussionsProvider` — loads the topics (see *Data Loading*) |

## Availability

Only shown when the current unit has a discussion topic enabled in context. Both conditions must be true:
- `topic.id` — a discussion topic exists for the unit
- `topic.enabledInContext` — discussions are enabled for this context

## Exports

| Export | Description |
|--------|-------------|
| `discussionsWidgetConfig` | Ready-to-use widget config object |
| `discussionsIsAvailable` | Availability function, usable standalone for custom configs |
| `DiscussionsProvider` | The widget's `Provider`; loads the course's discussion topics into the React Query cache |

## Data Loading

The widget's `Provider`, `DiscussionsProvider`, observes the course's discussion-topics query (`discussionTopicsQuery` in `courseware/data/apiHooks.ts`), enabled only when `DISCUSSIONS_MFE_BASE_URL` is configured and the course has a `discussion` tab. The sidebar framework mounts it around the sidebar children whether or not the widget is available, so the topics load once per sidebar mount and not again when course metadata changes. The query is bridged into the `discussionTopics` model for the widget's `useModel` readers (transitional, #1977). Because the fetch starts after mount, the initial `isAvailable` check (and initial sidebar computation) runs before the topics arrive; the framework's sync logic re-evaluates availability once the query resolves.

The `DiscussionsTrigger` component itself is a pure render component — it reads the `discussionTopics` model and fetches nothing.

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
