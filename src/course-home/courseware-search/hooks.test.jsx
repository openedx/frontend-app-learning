import { renderHook, act, waitFor } from '@testing-library/react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  useCoursewareSearchFeatureFlag,
  useCoursewareSearchParams,
  useElementBoundingBox,
  useLockScroll,
} from './hooks';
import { useCoursewareSearchEnabled } from './data/apiHooks';

jest.mock('react-router-dom');
jest.mock('./data/apiHooks');

describe('CoursewareSearch Hooks', () => {
  const courses = {
    123: { enabled: true },
    456: { enabled: false },
  };

  beforeEach(() => {
    useCoursewareSearchEnabled.mockImplementation((courseId) => ({ data: courses[courseId] }));
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
      await waitFor(() => expect(useCoursewareSearchEnabled).toBeCalledTimes(1));
      expect(hook.result.current).toBe(true);
    });

    it('should return false if feature is disabled', async () => {
      const hook = await renderTestHook(false);
      await waitFor(() => expect(useCoursewareSearchEnabled).toBeCalledTimes(1));
      expect(hook.result.current).toBe(false);
    });
  });

  describe('useElementBoundingBox', () => {
    let getBoundingClientRectSpy;
    const renderTestHook = async ({ mockedInfo }) => {
      getBoundingClientRectSpy = jest.fn(() => ({ ...mockedInfo }));
      const elementRef = { current: mockedInfo ? { getBoundingClientRect: getBoundingClientRectSpy } : null };

      let hook;
      await act(async () => {
        hook = renderHook(() => useElementBoundingBox(elementRef));
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
        await renderTestHook({ mockedInfo });

        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.anything());
        expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.anything());
      });

      it('should unbindbind resize and scroll events when unmounted', async () => {
        const hook = await renderTestHook({ mockedInfo });
        hook.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.anything());
        expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.anything());
      });

      it('should return the element bounding box', async () => {
        const hook = await renderTestHook({ mockedInfo });

        await waitFor(() => expect(getBoundingClientRectSpy).toHaveBeenCalled());

        expect(hook.result.current).toEqual(mockedInfo);
      });

      it('should call getBoundingClientRect on window resize', async () => {
        const hook = await renderTestHook({ mockedInfo });

        act(() => {
          // Trigger the window resize event.
          global.innerWidth = 500;
          global.dispatchEvent(new Event('resize'));
        });

        expect(hook.result.current).toEqual(mockedInfo);
      });
    });

    describe('when element is NOT present', () => {
      it('should return undefined and bind no events', async () => {
        const hook = await renderTestHook({});

        expect(hook.result.current).toBeUndefined();
        expect(addEventListenerSpy).not.toHaveBeenCalledWith('resize', expect.anything());
      });

      it('should return undefined when given no ref at all', async () => {
        let hook;
        await act(async () => {
          hook = renderHook(() => useElementBoundingBox(undefined));
        });

        expect(hook.result.current).toBeUndefined();
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
      windowScrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {}); // jsdom has no scrolling.
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
    // Each update rewrites the address in place, so none resets the scroll.
    const inPlace = { preventScrollReset: true };
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
      expect(setSearchParams).toHaveBeenLastCalledWith(expect.any(Function), inPlace);

      setFilter('setFilter');
      expect(setSearchParams).toHaveBeenLastCalledWith(expect.any(Function), inPlace);

      clearSearchParams();
      expect(setSearchParams).toHaveBeenLastCalledWith(initSearch, inPlace);
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
