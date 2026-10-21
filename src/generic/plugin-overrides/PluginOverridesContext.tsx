import React, {
  createContext, useCallback, useContext, useMemo, useState, ReactNode,
} from 'react';

export type OverrideMethod<T> = (previousResult: T) => T;

// pluginName -> methodName -> method. The method-name set is open and each name's value type is
// the host's business, so the map can't name them: a `never` parameter accepts any
// OverrideMethod<T> on registration and makes the stored method uncallable until the host
// asserts its T in usePluginsCallback.
type OverrideMethods = Record<string, Record<string, (previousResult: never) => unknown>>;

interface OverrideMethodKey {
  pluginName: string;
  methodName: string;
}

interface RegisterOverrideMethodPayload<T> extends OverrideMethodKey {
  method: OverrideMethod<T>;
}

interface PluginOverridesContextValue {
  overrideMethods: OverrideMethods;
  registerOverrideMethod: <T>(payload: RegisterOverrideMethodPayload<T>) => void;
  unregisterOverrideMethod: (key: OverrideMethodKey) => void;
}

const PluginOverridesContext = createContext<PluginOverridesContextValue | null>(null);

export const PluginOverridesProvider = ({ children }: { children: ReactNode }) => {
  const [overrideMethods, setOverrideMethods] = useState<OverrideMethods>({});

  // Typed through useCallback's parameter: a generic arrow (`<T,>(…) =>`) in .tsx gets autofixed
  // into JSX-ambiguous syntax, and a named generic function expression loses its <T> to
  // prefer-arrow-callback.
  const registerOverrideMethod = useCallback<PluginOverridesContextValue['registerOverrideMethod']>(
    ({ pluginName, methodName, method }) => {
      setOverrideMethods((current) => ({
        ...current,
        [pluginName]: { ...current[pluginName], [methodName]: method },
      }));
    },
    [],
  );

  const unregisterOverrideMethod = useCallback(({ pluginName, methodName }: OverrideMethodKey) => {
    setOverrideMethods((current) => {
      const { [methodName]: removed, ...rest } = current[pluginName] ?? {};
      return { ...current, [pluginName]: rest };
    });
  }, []);

  const value = useMemo<PluginOverridesContextValue>(() => ({
    overrideMethods,
    registerOverrideMethod,
    unregisterOverrideMethod,
  }), [overrideMethods, registerOverrideMethod, unregisterOverrideMethod]);

  return <PluginOverridesContext.Provider value={value}>{children}</PluginOverridesContext.Provider>;
};

export const usePluginOverrides = (): PluginOverridesContextValue => {
  const context = useContext(PluginOverridesContext);
  if (!context) {
    throw new Error('usePluginOverrides must be used within a PluginOverridesProvider');
  }
  return context;
};

// Returns a function that runs `defaultMethod` and then passes the result through every
// registered override for `methodName`, in registration order.
export function usePluginsCallback<T>(methodName: string, defaultMethod: () => T): () => T {
  const { overrideMethods } = usePluginOverrides();
  return () => Object.values(overrideMethods).reduce(
    (result, plugin) => (
      plugin[methodName] ? (plugin[methodName] as OverrideMethod<T>)(result) : result
    ),
    defaultMethod(),
  );
}
