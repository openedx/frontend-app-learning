import { act, renderHook } from '@testing-library/react';

import { ToastProvider, useToast } from './ToastContext';

const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

describe('ToastContext', () => {
  it('throws when used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useToast())).toThrow(
      'useToast must be used within a ToastProvider',
    );
    consoleError.mockRestore();
  });

  it('starts with no content and closed', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toastContent).toBeNull();
    expect(result.current.isToastOpen).toBe(false);
  });

  it('setToastContent sets the content without opening the toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    const content = { message: 'hello', action: { label: 'go', href: '/x' } };

    act(() => result.current.setToastContent(content));

    expect(result.current.toastContent).toEqual(content);
    expect(result.current.isToastOpen).toBe(false);
  });

  it('openToast and closeToast toggle visibility without touching content', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    const content = { message: 'hello' };
    act(() => result.current.setToastContent(content));

    act(() => result.current.openToast());
    expect(result.current.isToastOpen).toBe(true);
    expect(result.current.toastContent).toEqual(content);

    act(() => result.current.closeToast());
    expect(result.current.isToastOpen).toBe(false);
    expect(result.current.toastContent).toEqual(content);
  });
});
