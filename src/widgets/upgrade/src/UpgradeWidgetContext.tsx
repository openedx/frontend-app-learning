import {
  createContext, useCallback, useContext, useMemo, useState, type ReactNode,
} from 'react';

import { useSidebar } from '@src/courseware/course/sidebar/SidebarContext';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';

interface UpgradeWidgetContextValue {
  upgradeWidgetStatus: string | null; // 'active' | 'inactive' | null
  setUpgradeWidgetStatus: (status: string) => void;
  upgradeCurrentState: string | null; // Current upgrade stage
  setUpgradeCurrentState: (state: string) => void;
  onUpgradeWidgetSeen: () => void; // Mark widget as seen (hides red dot)
}

const UpgradeWidgetContext = createContext<UpgradeWidgetContextValue | null>(null);

export const UpgradeWidgetProvider = ({ children }: { children: ReactNode }) => {
  const { courseId } = useSidebar();

  const [upgradeWidgetStatus, setUpgradeWidgetStatusState] = useState<string | null>(
    () => getLocalStorage(`upgradeWidget.${courseId}`) || 'active',
  );
  const [upgradeCurrentState, setUpgradeCurrentStateRaw] = useState<string | null>(
    () => getLocalStorage(`upgradeWidgetState.${courseId}`) || null,
  );

  const setUpgradeWidgetStatus = useCallback((status: string) => {
    setUpgradeWidgetStatusState(status);
    setLocalStorage(`upgradeWidget.${courseId}`, status);
  }, [courseId]);

  const setUpgradeCurrentState = useCallback((state: string) => {
    setUpgradeCurrentStateRaw(state);
    setLocalStorage(`upgradeWidgetState.${courseId}`, state);
  }, [courseId]);

  const onUpgradeWidgetSeen = useCallback(() => {
    setUpgradeWidgetStatus('inactive');
  }, [setUpgradeWidgetStatus]);

  const value = useMemo<UpgradeWidgetContextValue>(() => ({
    upgradeWidgetStatus,
    setUpgradeWidgetStatus,
    upgradeCurrentState,
    setUpgradeCurrentState,
    onUpgradeWidgetSeen,
  }), [
    upgradeWidgetStatus,
    setUpgradeWidgetStatus,
    upgradeCurrentState,
    setUpgradeCurrentState,
    onUpgradeWidgetSeen,
  ]);

  return (
    <UpgradeWidgetContext.Provider value={value}>
      {children}
    </UpgradeWidgetContext.Provider>
  );
};

export function useUpgradeWidgetContext(): UpgradeWidgetContextValue {
  const ctx = useContext(UpgradeWidgetContext);
  if (!ctx) {
    throw new Error('useUpgradeWidgetContext must be used inside UpgradeWidgetProvider');
  }
  return ctx;
}

export default UpgradeWidgetContext;
