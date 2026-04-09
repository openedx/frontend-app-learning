# Discussions Widget

Built-in right-sidebar widget that embeds the Discussions MFE in an iframe for the current unit.

## Widget Config

| Field | Value |
|-------|-------|
| `id` | `DISCUSSIONS` |
| `priority` | `10` (highest built-in priority) |
| `isAvailable` | `({ course }) => !!(baseUrl && hasDiscussionTab)` |
| `prefetch` | Dispatches `getCourseDiscussionTopics` when discussion tab exists |

## Availability

The widget is registered as available at **course level** — it appears in the sidebar trigger bar whenever:
- `DISCUSSIONS_MFE_BASE_URL` is configured
- The course has a `discussion` tab

At **render time**, the `DiscussionsTrigger` and `DiscussionsSidebar` components additionally check the unit-level discussion topic (`topic?.id && topic?.enabledInContext`). This two-tier approach keeps the trigger visible across the course while gracefully rendering nothing for units without an active discussion topic.

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

## Prefetch

The widget defines a `prefetch` function that is called by `SidebarContextProvider` on mount. It dispatches `getCourseDiscussionTopics(courseId)` to preload discussion topic data into the Redux store, so that the `DiscussionsTrigger` and `DiscussionsSidebar` can read per-unit topic availability from the `discussionTopics` model without needing their own data-fetching side effects.
