## How to develop plugin

You can define plugin in `env.config.jsx` see `example.env.config.jsx` as example.

## Current caveat

- The way for how I deal with override method is still wonky
  - The redux still require middleware to ignore the plugin's action from serializing
  - I am not sure how it behave with useCallback, useMemo, ...etc
  - There are still open question on how to write it properly

## Current work that should consider core part and extendable for the future plugin framework

- `usePluingsCallback` is the callback supose to be some level of equality to be using `React.useCallback`. It would try to execute the function, then any plugin that try `registerOverrideMethod`. The order of the it being run isn't the determined. There are a couple things I want to add:
  - I might consider testing it with `zustand` library to make sure it is portable and not rely on `redux`. I tried to do this with provider, but it seems to run into infinite loop of trigger changed.

- `registerOverrideMethod` is working like a way to register callback that behave like a middleware. It ran the default one, then pass the result of the default one to the plugin. Any plugin that register the override can update the value. Alternatively, we can override the function completely instead applying each affect. Or we can support both. But it requires a bit more thought out architecture.
