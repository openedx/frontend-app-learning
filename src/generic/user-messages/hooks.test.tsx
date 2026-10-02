import { renderHook } from '@testing-library/react';

import { useAlert } from './hooks';

describe('useAlert', () => {
  it('throws when used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAlert(true, { code: 'clientTestAlert' }))).toThrow(
      'useAlert must be used within a UserMessagesProvider',
    );
    consoleError.mockRestore();
  });
});
