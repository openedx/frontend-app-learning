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
 * Check if the user has explicitly closed the sidebar this session.
 * Session-scoped so we can tell "user closed everything" apart from
 * "first visit / nothing stored" without polluting the per-course
 * stored sidebar id.
 * @returns {boolean} True if the user has explicitly closed the sidebar
 */
export function isSidebarClosedByUser() {
  return safeSessionStorage.getItem(STORAGE_KEYS.SIDEBAR_CLOSED_BY_USER) === 'true';
}

/**
 * Mark whether the user has explicitly closed the sidebar this session.
 * @param {boolean} closed - Whether the user has closed the sidebar
 */
export const setSidebarClosedByUser = (closed) => {
  if (closed) {
    safeSessionStorage.setItem(STORAGE_KEYS.SIDEBAR_CLOSED_BY_USER, 'true');
  } else {
    safeSessionStorage.removeItem(STORAGE_KEYS.SIDEBAR_CLOSED_BY_USER);
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
