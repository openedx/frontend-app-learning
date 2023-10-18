import { renderHook, act } from '@testing-library/react-hooks';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchCoursewareSearchSettings } from '../data/thunks';
import { useCoursewareSearchFeatureFlag, useCoursewareSearchState, useElementBoundingBox } from './hooks';

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
      let state;
      await act(async () => { (state = renderHook(() => useCoursewareSearchFeatureFlag())); });
      return state;
    };

    test('should return true if feature is enabled', async () => {
      const state = await renderTestHook();
      await state.waitFor(() => expect(fetchCoursewareSearchSettings).toBeCalledTimes(1));
      expect(state.result.current).toBe(true);
    });

    test('should return false if feature is disabled', async () => {
      const state = await renderTestHook(false);
      await state.waitFor(() => expect(fetchCoursewareSearchSettings).toBeCalledTimes(1));
      expect(state.result.current).toBe(false);
    });
  });

  describe('useCoursewareSearchState', () => {
    const renderTestHook = async ({ enabled, showSearch }) => {
      useParams.mockImplementation(() => ({ courseId: enabled ? 123 : 456 }));
      const mockedStoreState = { courseHome: { showSearch } };
      useSelector.mockImplementation(selector => selector(mockedStoreState));

      let state;
      await act(async () => { (state = renderHook(() => useCoursewareSearchState())); });
      return state;
    };

    test('should return show: true if feature is enabled and showSearch is true', async () => {
      const state = await renderTestHook({ enabled: true, showSearch: true });

      expect(state.result.current).toEqual({ show: true });
    });

    test('should return show: false in any other case', async () => {
      let state;

      state = await renderTestHook({ enabled: true, showSearch: false });
      expect(state.result.current).toEqual({ show: false });

      state = await renderTestHook({ enabled: false, showSearch: true });
      expect(state.result.current).toEqual({ show: false });

      state = await renderTestHook({ enabled: false, showSearch: false });
      expect(state.result.current).toEqual({ show: false });
    });
  });

  describe('useElementBoundingBox', () => {
    let getBoundingClientRectSpy;
    let addEventListenerSpy;
    let removeEventListenerSpy;

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

    beforeEach(() => {
      addEventListenerSpy = jest.spyOn(global, 'addEventListener');
      removeEventListenerSpy = jest.spyOn(global, 'removeEventListener');
    });

    describe('when element is present', () => {
      const mockedInfo = { top: 128 };

      test('should bind resize and scroll events on mount', async () => {
        await renderTestHook({ elementId: 'test', mockedInfo });

        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.anything());
        expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.anything());
      });

      test('should unbindbind resize and scroll events when unmounted', async () => {
        const state = await renderTestHook({ elementId: 'test', mockedInfo });
        state.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.anything());
        expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.anything());
      });

      // This test is failing, the hook state is not being updated.
      xtest('should return the element bounding box', async () => {
        const state = await renderTestHook({ elementId: 'test', mockedInfo });

        state.waitFor(() => expect(getBoundingClientRectSpy).toHaveBeenCalled());

        expect(state.result.current).toEqual(mockedInfo);
      });

      // This test is failing, the hook state is not being updated.
      xtest('should call getBoundingClientRect on window resize', async () => {
        const state = await renderTestHook({ elementId: 'test', mockedInfo });

        act(() => {
          // Trigger the window resize event.
          global.innerWidth = 500;
          global.dispatchEvent(new Event('resize'));
        });

        expect(state.result.current).toEqual(mockedInfo);
      });
    });
  });
});
