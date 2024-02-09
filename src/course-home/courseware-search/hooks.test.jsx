import { renderHook, act } from '@testing-library/react-hooks';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchCoursewareSearchSettings } from '../data/thunks';
import {
  useCoursewareSearchFeatureFlag,
  useCoursewareSearchParams,
  useCoursewareSearchState,
  useElementBoundingBox,
  useLockScroll,
} from './hooks';

jest.mock('react-redux');
jest.mock('react-router-dom');
jest.mock('../data/thunks');

describe('CoursewareSearch Hooks', () => {
  const courses = {
    123: { enabled: true },
    456: { enabled: false },
  };

  beforeEach(() => {
    fetchCoursewareSearchSettings.mockImplementation((courseId) => Promise.resolve(courses[courseId]));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('useCoursewareSearchFeatureFlag', () => {
    const renderTestHook = async (enabled = true) => {
      useParams.mockImplementation(() => ({ courseId: enabled ? 123 : 456 }));
      let hook;
      await act(async () => { (hook = renderHook(() => useCoursewareSearchFeatureFlag())); });
      return hook;
    };

    it('should return true if feature is enabled', async () => {
      const hook = await renderTestHook();
      await hook.waitFor(() => expect(fetchCoursewareSearchSettings).toBeCalledTimes(1));
      expect(hook.result.current).toBe(true);
    });

    it('should return false if feature is disabled', async () => {
      const hook = await renderTestHook(false);
      await hook.waitFor(() => expect(fetchCoursewareSearchSettings).toBeCalledTimes(1));
      expect(hook.result.current).toBe(false);
    });
  });

  describe('useCoursewareSearchState', () => {
    const renderTestHook = async ({ enabled, showSearch }) => {
      useParams.mockImplementation(() => ({ courseId: enabled ? 123 : 456 }));
      const mockedStoreState = { courseHome: { showSearch } };
      useSelector.mockImplementation(selector => selector(mockedStoreState));

      let hook;
      await act(async () => { (hook = renderHook(() => useCoursewareSearchState())); });
      return hook;
    };

    it('should return show: true if feature is enabled and showSearch is true', async () => {
      const hook = await renderTestHook({ enabled: true, showSearch: true });

      expect(hook.result.current).toEqual({ show: true });
    });

    it('should return show: false in any other case', async () => {
      let hook;

      hook = await renderTestHook({ enabled: true, showSearch: false });
      expect(hook.result.current).toEqual({ show: false });

      hook = await renderTestHook({ enabled: false, showSearch: true });
      expect(hook.result.current).toEqual({ show: false });

      hook = await renderTestHook({ enabled: false, showSearch: false });
      expect(hook.result.current).toEqual({ show: false });
    });
  });

  describe('useElementBoundingBox', () => {
    let getBoundingClientRectSpy;
    const renderTestHook = async ({ elementId, mockedInfo }) => {
      getBoundingClientRectSpy = jest.spyOn(document, 'getElementById').mockImplementation(() => (
        mockedInfo
          ? { getBoundingClientRect: () => ({ ...mockedInfo }) }
          : undefined
      ));

      let hook;
      await act(async () => {
        hook = renderHook(() => useElementBoundingBox(elementId));
      });

      return hook;
    };

    let addEventListenerSpy;
    let removeEventListenerSpy;
    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(global, 'addEventListener');
      removeEventListenerSpy = jest.spyOn(global, 'removeEventListener');
    });

    describe('when element is present', () => {
      const mockedInfo = { top: 128 };

      it('should bind resize and scroll events on mount', async () => {
        await renderTestHook({ elementId: 'test', mockedInfo });

        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.anything());
        expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.anything());
      });

      it('should unbindbind resize and scroll events when unmounted', async () => {
        const hook = await renderTestHook({ elementId: 'test', mockedInfo });
        hook.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.anything());
        expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.anything());
      });

      it('should return the element bounding box', async () => {
        const hook = await renderTestHook({ elementId: 'test', mockedInfo });

        hook.waitFor(() => expect(getBoundingClientRectSpy).toHaveBeenCalled());

        expect(hook.result.current).toEqual(mockedInfo);
      });

      it('should call getBoundingClientRect on window resize', async () => {
        const hook = await renderTestHook({ elementId: 'test', mockedInfo });

        act(() => {
          // Trigger the window resize event.
          global.innerWidth = 500;
          global.dispatchEvent(new Event('resize'));
        });

        expect(hook.result.current).toEqual(mockedInfo);
      });
    });

    describe('when element is NOT present', () => {
      let consoleWarnSpy;
      beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should log a warning and return undefined', async () => {
        await renderTestHook({ elementId: 'happiness' });

        expect(consoleWarnSpy).toHaveBeenCalledWith("useElementBoundingBox(): Unable to find element with id='happiness' in the document.");
      });
    });
  });

  describe('useLockScroll', () => {
    const renderTestHook = () => (
      renderHook(() => useLockScroll())
    );

    let windowScrollSpy;
    let addBodyClassSpy;
    let removeBodyClassSpy;
    let hook;

    beforeEach(() => {
      windowScrollSpy = jest.spyOn(window, 'scrollTo');
      addBodyClassSpy = jest.spyOn(document.body.classList, 'add');
      removeBodyClassSpy = jest.spyOn(document.body.classList, 'remove');
      hook = renderTestHook();
    });

    it('should perform a scrollTo(0, 0) on mount', () => {
      expect(windowScrollSpy).toHaveBeenCalledWith(0, 0);
    });

    it('should append a _search-no-scroll on mount to the document body', () => {
      expect(addBodyClassSpy).toHaveBeenCalledWith('_search-no-scroll');
    });

    it('should remove the _search-no-scroll on unmount', () => {
      hook.unmount();

      expect(removeBodyClassSpy).toHaveBeenCalledWith('_search-no-scroll');
    });
  });

  describe('useSearchParams', () => {
    const initSearch = { q: '', f: '' };
    const q = { value: '' };
    const f = { value: '' };
    const mockedQuery = { q, f };
    const searchParams = { get: (prop) => mockedQuery[prop].value };
    const setSearchParams = jest.fn();

    beforeEach(() => {
      useSearchParams.mockImplementation(() => [searchParams, setSearchParams]);
    });

    it('should init the search params properly', () => {
      const {
        query, filter, setQuery, setFilter, clearSearchParams,
      } = useCoursewareSearchParams();

      expect(useSearchParams).toBeCalledWith(initSearch);
      expect(query).toBe('');
      expect(filter).toBe('');

      setQuery('setQuery');
      expect(setSearchParams).toBeCalledWith(expect.any(Function));

      setFilter('setFilter');
      expect(setSearchParams).toBeCalledWith(expect.any(Function));

      clearSearchParams();
      expect(setSearchParams).toBeCalledWith(initSearch);
    });

    it('should return the query and lowercase filter if any', () => {
      q.value = '42';
      f.value = 'LOWERCASE';
      const { query, filter } = useCoursewareSearchParams();

      expect(query).toBe('42');
      expect(filter).toBe('lowercase');
    });
  });
});
