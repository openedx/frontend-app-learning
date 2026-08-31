import { renderHook } from '@testing-library/react';

import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import { useCoursewareMetadata, useCoursewareOutline } from './apiHooks';
import {
  fetchCourseDenied,
  fetchCourseFailure,
  fetchCourseRequest,
  fetchCourseSuccess,
} from './slice';
import { useCourseExitStatusBridge, useCourseStatusBridge } from './statusBridge';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
jest.mock('./apiHooks');
jest.mock('@src/course-home/data/apiHooks');

const courseId = 'course-v1:edX+Demo+2020';

type MetaQuery = ReturnType<typeof useCoursewareMetadata>;
type OutlineQuery = ReturnType<typeof useCoursewareOutline>;
type HomeMetaQuery = ReturnType<typeof useCourseHomeMeta>;

const pending = { isPending: true, isSuccess: false, isError: false };
const success = (data?: unknown) => ({
  isPending: false, isSuccess: true, isError: false, data,
});
const errored = (error?: unknown) => ({
  isPending: false, isSuccess: false, isError: true, error,
});
const access = success({ courseAccess: { hasAccess: true } });
const noAccess = success({ courseAccess: { hasAccess: false } });

describe('useCourseStatusBridge', () => {
  const render = (metadata: object, outline: object, courseHomeMeta: object, id: string | undefined = courseId) => {
    jest.mocked(useCoursewareMetadata).mockReturnValue(metadata as MetaQuery);
    jest.mocked(useCoursewareOutline).mockReturnValue(outline as OutlineQuery);
    jest.mocked(useCourseHomeMeta).mockReturnValue(courseHomeMeta as HomeMetaQuery);
    renderHook(() => useCourseStatusBridge(id));
  };

  beforeEach(() => { mockDispatch.mockClear(); });

  it('dispatches nothing without a courseId', () => {
    render(success(), success(), access, '');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('requests while any query is pending', () => {
    render(pending, success(), access);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseRequest({ courseId }));
  });

  it('succeeds when the learner has access and the outline loaded', () => {
    render(success(), success(), access);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseSuccess({ courseId }));
  });

  it('denies when the learner lacks access', () => {
    render(success(), success(), noAccess);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseDenied({ courseId }));
  });

  it('fails with the 403 detail/code when a query errors', () => {
    const error = { response: { status: 403, data: { detail: 'No access', error_code: 'course_access_redirect' } } };
    render(success(), success(), errored(error));
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseFailure({
      courseId,
      errorMessage: 'No access',
      errorCode: 'course_access_redirect',
    }));
  });

  it('fails without detail/code for a non-403 error', () => {
    render(errored({ response: { status: 500 } }), success(), access);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseFailure({ courseId }));
  });

  it('fails without detail/code for a 403 with no body', () => {
    render(success(), success(), errored({ response: { status: 403 } }));
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseFailure({ courseId }));
  });

  it('does not re-dispatch on re-render when the query state is unchanged', () => {
    jest.mocked(useCoursewareMetadata).mockImplementation(() => success() as MetaQuery);
    jest.mocked(useCoursewareOutline).mockImplementation(() => success() as OutlineQuery);
    jest.mocked(useCourseHomeMeta).mockImplementation(() => access as HomeMetaQuery);

    const { rerender } = renderHook(() => useCourseStatusBridge(courseId));
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    mockDispatch.mockClear();
    rerender();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

describe('useCourseExitStatusBridge', () => {
  const render = (metadata: object, courseHomeMeta: object, id: string | undefined = courseId) => {
    renderHook(() => useCourseExitStatusBridge(id, metadata as MetaQuery, courseHomeMeta as HomeMetaQuery));
  };

  beforeEach(() => { mockDispatch.mockClear(); });

  it('dispatches nothing without a courseId', () => {
    render(success(), access, '');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('requests while a query is pending', () => {
    render(pending, access);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseRequest({ courseId }));
  });

  it('succeeds when the learner has access', () => {
    render(success(), access);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseSuccess({ courseId }));
  });

  it('denies when the learner lacks access', () => {
    render(success(), noAccess);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseDenied({ courseId }));
  });

  it('fails with the 403 detail/code when a query errors', () => {
    const error = { response: { status: 403, data: { detail: 'No access', error_code: 'course_access_redirect' } } };
    render(success(), errored(error));
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseFailure({
      courseId,
      errorMessage: 'No access',
      errorCode: 'course_access_redirect',
    }));
  });

  it('fails without detail/code for a non-403 error', () => {
    render(errored({ response: { status: 500 } }), access);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseFailure({ courseId }));
  });

  it('fails without detail/code for a 403 with no body', () => {
    render(success(), errored({ response: { status: 403 } }));
    expect(mockDispatch).toHaveBeenCalledWith(fetchCourseFailure({ courseId }));
  });

  it('does not re-dispatch on re-render when the query state is unchanged', () => {
    const { rerender } = renderHook(() => useCourseExitStatusBridge(
      courseId,
      success() as MetaQuery,
      success({ courseAccess: { hasAccess: true } }) as HomeMetaQuery,
    ));
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    mockDispatch.mockClear();
    rerender();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
