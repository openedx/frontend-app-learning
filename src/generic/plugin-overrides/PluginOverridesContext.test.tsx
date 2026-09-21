import { useEffect } from 'react';
import { act, render, renderHook } from '@testing-library/react';

import { PluginOverridesProvider, usePluginOverrides, usePluginsCallback } from './PluginOverridesContext';

const wrapper = ({ children }) => <PluginOverridesProvider>{children}</PluginOverridesProvider>;

function renderBoth<T>(methodName: string, defaultMethod: () => T) {
  return renderHook(() => ({
    ...usePluginOverrides(),
    callback: usePluginsCallback(methodName, defaultMethod),
  }), { wrapper });
}

describe('PluginOverridesContext', () => {
  it('throws when used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => usePluginOverrides())).toThrow(
      'usePluginOverrides must be used within a PluginOverridesProvider',
    );
    expect(() => renderHook(() => usePluginsCallback('m', () => 1))).toThrow(
      'usePluginOverrides must be used within a PluginOverridesProvider',
    );
    consoleError.mockRestore();
  });

  it('returns the default when nothing is registered', () => {
    const { result } = renderBoth('m', () => 'base');
    expect(result.current.callback()).toBe('base');
  });

  it('applies overrides over the default in registration order', () => {
    const { result } = renderBoth('m', () => 'base');

    act(() => result.current.registerOverrideMethod({ pluginName: 'a', methodName: 'm', method: (v) => `${v}+a` }));
    act(() => result.current.registerOverrideMethod({ pluginName: 'b', methodName: 'm', method: (v) => `${v}+b` }));

    expect(result.current.callback()).toBe('base+a+b');
  });

  it('replaces an override registered again for the same plugin and method', () => {
    const { result } = renderBoth('m', () => 'base');

    act(() => result.current.registerOverrideMethod({ pluginName: 'a', methodName: 'm', method: (v) => `${v}+old` }));
    act(() => result.current.registerOverrideMethod({ pluginName: 'a', methodName: 'm', method: (v) => `${v}+new` }));

    expect(result.current.callback()).toBe('base+new');
  });

  it('ignores overrides registered for other method names', () => {
    const { result } = renderBoth('m', () => 'base');

    act(() => result.current.registerOverrideMethod({ pluginName: 'a', methodName: 'other', method: (v) => `${v}+other` }));

    expect(result.current.callback()).toBe('base');
  });

  it('evaluates the default on every call', () => {
    let count = 0;
    const { result } = renderBoth('m', () => { count += 1; return count; });

    act(() => result.current.registerOverrideMethod({ pluginName: 'a', methodName: 'm', method: (v: number) => v * 10 }));

    expect(result.current.callback()).toBe(10);
    expect(result.current.callback()).toBe(20);
  });

  it('removes exactly the unregistered override', () => {
    const { result } = renderBoth('m', () => 'base');

    act(() => result.current.registerOverrideMethod({ pluginName: 'a', methodName: 'm', method: (v) => `${v}+a` }));
    act(() => result.current.registerOverrideMethod({ pluginName: 'b', methodName: 'm', method: (v) => `${v}+b` }));
    act(() => result.current.unregisterOverrideMethod({ pluginName: 'a', methodName: 'm' }));

    expect(result.current.callback()).toBe('base+b');
  });

  it('keeps an override after the component that registered it unmounts', () => {
    const Registrar = () => {
      const { registerOverrideMethod } = usePluginOverrides();
      useEffect(() => {
        registerOverrideMethod({ pluginName: 'a', methodName: 'm', method: (v) => `${v}+a` });
      }, [registerOverrideMethod]);
      return null;
    };
    let callback = () => '';
    const Host = () => {
      callback = usePluginsCallback('m', () => 'base');
      return null;
    };

    const { rerender } = render(
      <PluginOverridesProvider><Registrar /><Host /></PluginOverridesProvider>,
    );
    expect(callback()).toBe('base+a');

    rerender(<PluginOverridesProvider><Host /></PluginOverridesProvider>);
    expect(callback()).toBe('base+a');
  });
});
