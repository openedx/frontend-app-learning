import { logError } from '@edx/frontend-platform/logging';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import { STORAGE_KEYS } from '../constants';

const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
      return null;
    } catch (error) {
      logError('SessionStorage access error:', error);
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (error) {
      logError('SessionStorage write error:', error);
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      logError('SessionStorage remove error:', error);
    }
  },
};

/**
 * Check if the course outline sidebar is manually collapsed
 * @returns {boolean} True if the outline sidebar is hidden
 */
export function isOutlineSidebarCollapsed() {
  return safeSessionStorage.getItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN) === 'true';
}

/**
 * Set the course outline sidebar collapsed state
 * @param {boolean} isCollapsed - Whether the sidebar should be collapsed
 */
export const setOutlineSidebarCollapsed = (isCollapsed) => {
  if (isCollapsed) {
    safeSessionStorage.setItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN, 'true');
  } else {
    safeSessionStorage.removeItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN);
  }
};

/**
 * Get the stored sidebar ID for a course
 * @param {string} courseId - The course ID
 * @returns {string|null} The stored sidebar ID or null
 */
export function getSidebarId(courseId) {
  return getLocalStorage(`${STORAGE_KEYS.SIDEBAR_ID}.${courseId}`) || null;
}

/**
 * Set the sidebar ID for a course
 * @param {string} courseId - The course ID
 * @param {string|null} sidebarId - The sidebar ID to store
 */
export const setSidebarId = (courseId, sidebarId) => {
  setLocalStorage(`${STORAGE_KEYS.SIDEBAR_ID}.${courseId}`, sidebarId);
};
