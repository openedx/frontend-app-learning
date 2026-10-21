import { act, renderHook } from '@testing-library/react';

import { CoursewareSearchProvider, useCoursewareSearch } from './CoursewareSearchContext';

const wrapper = ({ children }) => <CoursewareSearchProvider>{children}</CoursewareSearchProvider>;

describe('CoursewareSearchContext', () => {
  it('throws when used outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCoursewareSearch())).toThrow(
      'useCoursewareSearch must be used within a CoursewareSearchProvider',
    );
    consoleError.mockRestore();
  });

  it('starts closed', () => {
    const { result } = renderHook(() => useCoursewareSearch(), { wrapper });
    expect(result.current.show).toBe(false);
  });

  it('open() shows the search and close() hides it', () => {
    const { result } = renderHook(() => useCoursewareSearch(), { wrapper });

    act(() => result.current.open());
    expect(result.current.show).toBe(true);

    act(() => result.current.close());
    expect(result.current.show).toBe(false);
  });
});
