import { renderHook } from '@testing-library/react';

import { useSidebar } from './SidebarContext';

describe('useSidebar', () => {
  it('throws outside a SidebarProvider', () => {
    expect(() => renderHook(() => useSidebar()))
      .toThrow('useSidebar must be used within a SidebarProvider');
  });
});
