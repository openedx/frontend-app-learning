import { logError } from '@edx/frontend-platform/logging';
import { getLocalStorage, setLocalStorage } from '@src/data/localStorage';
import {
  isOutlineSidebarCollapsed,
  setOutlineSidebarCollapsed,
  getSidebarId,
  setSidebarId,
} from './storage';
import { STORAGE_KEYS } from '../constants';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('@src/data/localStorage', () => ({
  getLocalStorage: jest.fn(),
  setLocalStorage: jest.fn(),
}));

describe('sidebar storage utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  describe('isOutlineSidebarCollapsed', () => {
    it('returns true when sessionStorage contains "true"', () => {
      sessionStorage.setItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN, 'true');

      expect(isOutlineSidebarCollapsed()).toBe(true);
    });

    it('returns false when sessionStorage key is absent', () => {
      expect(isOutlineSidebarCollapsed()).toBe(false);
    });

    it('returns false when sessionStorage contains "false"', () => {
      sessionStorage.setItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN, 'false');

      expect(isOutlineSidebarCollapsed()).toBe(false);
    });

    it('returns false and logs error when sessionStorage.getItem throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(isOutlineSidebarCollapsed()).toBe(false);
      expect(logError).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('setOutlineSidebarCollapsed', () => {
    it('sets the storage key to "true" when collapsed=true', () => {
      setOutlineSidebarCollapsed(true);

      expect(sessionStorage.getItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN)).toBe('true');
    });

    it('removes the storage key when collapsed=false', () => {
      sessionStorage.setItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN, 'true');
      setOutlineSidebarCollapsed(false);

      expect(sessionStorage.getItem(STORAGE_KEYS.OUTLINE_SIDEBAR_HIDDEN)).toBeNull();
    });

    it('does not throw and logs error when sessionStorage.setItem throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => setOutlineSidebarCollapsed(true)).not.toThrow();
      expect(logError).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('does not throw and logs error when sessionStorage.removeItem throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(() => setOutlineSidebarCollapsed(false)).not.toThrow();
      expect(logError).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getSidebarId', () => {
    it('returns the stored sidebar ID for a course', () => {
      getLocalStorage.mockReturnValue('DISCUSSIONS');

      expect(getSidebarId('course-123')).toBe('DISCUSSIONS');
      expect(getLocalStorage).toHaveBeenCalledWith(`${STORAGE_KEYS.SIDEBAR_ID}.course-123`);
    });

    it('returns null when nothing is stored', () => {
      getLocalStorage.mockReturnValue(null);

      expect(getSidebarId('course-123')).toBeNull();
    });

    it('returns null when localStorage returns undefined', () => {
      getLocalStorage.mockReturnValue(undefined);

      expect(getSidebarId('course-123')).toBeNull();
    });
  });

  describe('setSidebarId', () => {
    it('calls setLocalStorage with the correct key and value', () => {
      setSidebarId('course-123', 'DISCUSSIONS');

      expect(setLocalStorage).toHaveBeenCalledWith(
        `${STORAGE_KEYS.SIDEBAR_ID}.course-123`,
        'DISCUSSIONS',
      );
    });

    it('can store null to clear the sidebar', () => {
      setSidebarId('course-123', null);

      expect(setLocalStorage).toHaveBeenCalledWith(
        `${STORAGE_KEYS.SIDEBAR_ID}.course-123`,
        null,
      );
    });
  });
});
