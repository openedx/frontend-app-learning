## How to develop plugin

You can define plugin in `env.config.jsx` see `example.env.config.jsx` as example.

## Current caveat

- The way for how I deal with override method is still wonky
  - The redux still require middleware to ignore the plugin's action from serializing
  - I am not sure how it behave with useCallback, useMemo, ...etc
  - There are still open question on how to write it properly
- `@plugin-framework` will be replace by https://github.com/openedx/frontend-plugin-framework/. I will leave it there for now.
- I am still unsure about writing tests for this