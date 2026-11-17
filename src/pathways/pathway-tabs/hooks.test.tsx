import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { usePathwayTabs } from './hooks';

const wrapper = ({ children }) => <IntlProvider locale="en">{children}</IntlProvider>;

describe('usePathwayTabs', () => {
  it('returns the pathway tabs with their URLs', () => {
    const { result } = renderHook(() => usePathwayTabs('pathway-1'), { wrapper });

    expect(result.current).toEqual([
      { tabId: 'outline', title: 'Outline', url: '/pathway/pathway-1/outline' },
      { tabId: 'progress', title: 'Progress', url: '/pathway/pathway-1/progress' },
      { tabId: 'achievements', title: 'Achievements', url: '/pathway/pathway-1/achievements' },
    ]);
  });

  it('returns no tabs without a pathway', () => {
    const { result } = renderHook(() => usePathwayTabs(undefined), { wrapper });

    expect(result.current).toEqual([]);
  });
});
