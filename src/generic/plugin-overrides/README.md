# Plugin overrides

A registry that lets a plugin rendered anywhere in the app override how the app computes a
value. It is not part of `@openedx/frontend-plugin-framework`: the framework decides *where* a
plugin renders (a `PluginSlot`); this registry lets that plugin change host behavior *elsewhere*
in the tree.

## Registering an override

Get `registerOverrideMethod` from `usePluginOverrides()` and call it from an effect. `pluginName`
is any string that identifies your plugin; it namespaces your overrides so they never collide with
another plugin's.

```jsx
import { useEffect } from 'react';
import { usePluginOverrides } from '@src/generic/plugin-overrides';

const MyPlugin = () => {
  const { registerOverrideMethod } = usePluginOverrides();

  useEffect(() => {
    registerOverrideMethod({
      pluginName: 'my-plugin',
      methodName: 'getIFrameUrl',
      method: (iframeUrl) => `${iframeUrl}&my_param=1`,
    });
  }, [registerOverrideMethod]);

  return null;
};
```

Semantics:

- An override is keyed by `(pluginName, methodName)`. Registering the same pair again replaces
  the previous method.
- The host computes its default first, then passes the result through every registered override
  for that `methodName`, in registration order. Each override receives the previous result and
  returns the next one.
- Nothing is removed when the registering component unmounts. Call
  `unregisterOverrideMethod({ pluginName, methodName })` (also from `usePluginOverrides()`) from
  the effect cleanup if the override should not outlive the component.

## Overridable methods

| `methodName` | Host | Value |
| --- | --- | --- |
| `getIFrameUrl` | `courseware/course/sequence/Unit/index.jsx` | The unit content iframe URL, as built by `Unit/urls.ts` (`/xblock/{id}` on the LMS with `show_title`, `show_bookmark`, `recheck_access`, `view`, `preview`, `format`, `exam_access`, `jumpToId`). Overrides receive and return the full URL string. |

## Adding an overridable method to the host

```js
import { usePluginsCallback } from '@src/generic/plugin-overrides';

const getUrl = usePluginsCallback('getIFrameUrl', () => getIFrameUrl({ ... }));
const iframeUrl = getUrl();
```

`usePluginsCallback(methodName, defaultMethod)` returns a function that runs `defaultMethod`
and applies the registered overrides. Document the new `methodName` in the table above.

## Migrating from the Redux plugin store

Before the React Query migration this registry was a Redux slice (`@src/generic/plugin-store`)
and plugins dispatched `registerOverrideMethod` as an action:

```diff
-import { useDispatch } from 'react-redux';
-import { registerOverrideMethod } from '@src/generic/plugin-store';
+import { usePluginOverrides } from '@src/generic/plugin-overrides';

 const MyPlugin = () => {
-  const dispatch = useDispatch();
+  const { registerOverrideMethod } = usePluginOverrides();

   useEffect(() => {
-    dispatch(registerOverrideMethod({ pluginName: 'my-plugin', methodName: 'getIFrameUrl', method }));
+    registerOverrideMethod({ pluginName: 'my-plugin', methodName: 'getIFrameUrl', method });
   }, [...]);
```

The payload and the fold semantics are unchanged.
