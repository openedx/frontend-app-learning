import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import SidebarContext from '@src/courseware/course/sidebar/SidebarContext';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';

/**
 * @typedef {Object} UpgradeWidgetContextValue
 * @property {string|null} upgradeWidgetStatus - 'active' | 'inactive' | null
 * @property {(status: string) => void} setUpgradeWidgetStatus
 * @property {string|null} upgradeCurrentState - Current upgrade stage
 * @property {(state: string) => void} setUpgradeCurrentState
 * @property {() => void} onUpgradeWidgetSeen - Mark widget as seen (hides red dot)
 */

const UpgradeWidgetContext = createContext(null);

export const UpgradeWidgetProvider = ({ children }) => {
  const { courseId } = useContext(SidebarContext);

  const [upgradeWidgetStatus, setUpgradeWidgetStatusState] = useState(
    () => getLocalStorage(`upgradeWidget.${courseId}`) || 'active',
  );
  const [upgradeCurrentState, setUpgradeCurrentStateRaw] = useState(
    () => getLocalStorage(`upgradeWidgetState.${courseId}`) || null,
  );

  const setUpgradeWidgetStatus = useCallback((status) => {
    setUpgradeWidgetStatusState(status);
    setLocalStorage(`upgradeWidget.${courseId}`, status);
  }, [courseId]);

  const setUpgradeCurrentState = useCallback((state) => {
    setUpgradeCurrentStateRaw(state);
    setLocalStorage(`upgradeWidgetState.${courseId}`, state);
  }, [courseId]);

  const onUpgradeWidgetSeen = useCallback(() => {
    setUpgradeWidgetStatus('inactive');
  }, [setUpgradeWidgetStatus]);

  const value = useMemo(() => ({
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

UpgradeWidgetProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUpgradeWidgetContext() {
  const ctx = useContext(UpgradeWidgetContext);
  if (!ctx) {
    throw new Error('useUpgradeWidgetContext must be used inside UpgradeWidgetProvider');
  }
  return ctx;
}

export default UpgradeWidgetContext;
