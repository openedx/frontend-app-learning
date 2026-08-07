import { act, renderHook } from '@testing-library/react';

import { TourProvider, useTourState } from './TourContext';

const wrapper = ({ children }) => <TourProvider>{children}</TourProvider>;

describe('TourContext', () => {
  it('throws when used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTourState())).toThrow(
      'useTourState must be used within a TourProvider',
    );
    consoleError.mockRestore();
  });

  it('starts with every show flag false', () => {
    const { result } = renderHook(() => useTourState(), { wrapper });
    expect(result.current).toMatchObject({
      showCoursewareTour: false,
      showExistingUserCourseHomeTour: false,
      showNewUserCourseHomeModal: false,
      showNewUserCourseHomeTour: false,
    });
  });

  it('setTourData derives the show flags from server data', () => {
    const { result } = renderHook(() => useTourState(), { wrapper });

    act(() => result.current.setTourData({
      courseHomeTourStatus: 'show-new-user-tour',
      showCoursewareTour: true,
    }));
    expect(result.current.showNewUserCourseHomeModal).toBe(true);
    expect(result.current.showCoursewareTour).toBe(true);
    expect(result.current.showExistingUserCourseHomeTour).toBe(false);

    act(() => result.current.setTourData({
      courseHomeTourStatus: 'show-existing-user-tour',
      showCoursewareTour: false,
    }));
    expect(result.current.showExistingUserCourseHomeTour).toBe(true);
    expect(result.current.showNewUserCourseHomeModal).toBe(false);
    expect(result.current.showCoursewareTour).toBe(false);
  });

  it('disableCourseHomeTour clears all course-home flags', () => {
    const { result } = renderHook(() => useTourState(), { wrapper });
    act(() => result.current.setTourData({ courseHomeTourStatus: 'show-new-user-tour' }));
    act(() => result.current.launchCourseHomeTour());
    act(() => result.current.disableCourseHomeTour());
    expect(result.current.showNewUserCourseHomeModal).toBe(false);
    expect(result.current.showNewUserCourseHomeTour).toBe(false);
    expect(result.current.showExistingUserCourseHomeTour).toBe(false);
  });

  it('disableCoursewareTour clears only the courseware flag', () => {
    const { result } = renderHook(() => useTourState(), { wrapper });
    act(() => result.current.setTourData({ showCoursewareTour: true }));
    act(() => result.current.disableCoursewareTour());
    expect(result.current.showCoursewareTour).toBe(false);
  });

  it('closeNewUserCourseHomeModal closes the modal without touching the tour', () => {
    const { result } = renderHook(() => useTourState(), { wrapper });
    act(() => result.current.setTourData({ courseHomeTourStatus: 'show-new-user-tour' }));
    act(() => result.current.closeNewUserCourseHomeModal());
    expect(result.current.showNewUserCourseHomeModal).toBe(false);
  });

  it('launchCourseHomeTour enables the new-user tour and clears the existing-user tour', () => {
    const { result } = renderHook(() => useTourState(), { wrapper });
    act(() => result.current.setTourData({ courseHomeTourStatus: 'show-existing-user-tour' }));
    act(() => result.current.launchCourseHomeTour());
    expect(result.current.showExistingUserCourseHomeTour).toBe(false);
    expect(result.current.showNewUserCourseHomeTour).toBe(true);
  });
});
