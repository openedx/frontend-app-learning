import React, { useContext, type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

import { useAlert } from './hooks';
import UserMessagesContext, { type UserMessagesContextValue } from './UserMessagesContext';
import UserMessagesProvider from './UserMessagesProvider';

describe('useAlert', () => {
  it('throws when used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAlert(true, { code: 'clientTestAlert' }))).toThrow(
      'useAlert must be used within a UserMessagesProvider',
    );
    consoleError.mockRestore();
  });

  it('adds its message while visible and removes it once hidden', () => {
    let messages: UserMessagesContextValue['messages'] = [];
    const CaptureMessages = () => {
      ({ messages } = useContext(UserMessagesContext)!);
      return null;
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <UserMessagesProvider>{children}<CaptureMessages /></UserMessagesProvider>
    );
    const { rerender } = renderHook(
      ({ isVisible }) => useAlert(isVisible, { code: 'clientTestAlert', topic: 'outline' }),
      { wrapper, initialProps: { isVisible: true } },
    );
    expect(messages).toEqual([expect.objectContaining({ code: 'clientTestAlert', topic: 'outline' })]);

    rerender({ isVisible: false });
    expect(messages).toEqual([]);
  });
});
