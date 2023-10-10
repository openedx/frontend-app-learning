import React from 'react';
import { render } from '@testing-library/react';
import {
  MemoryRouter as Router, matchPath, Routes, Route, mockNavigate,
} from 'react-router-dom';
import DecodePageRoute, { decodeUrl } from '.';

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const encodedCourseId = encodeURIComponent(decodedCourseId);
const deepEncodedCourseId = (() => {
  let path = encodedCourseId;
  for (let i = 0; i < 5; i++) {
    path = encodeURIComponent(path);
  }
  return path;
})();

jest.mock('@edx/frontend-platform/react', () => ({
  PageWrap: (props) => `PageWrap: ${JSON.stringify(props, null, 2)}`,
}));
jest.mock('../constants', () => ({
  DECODE_ROUTES: {
    MOCK_ROUTE_1: '/course/:courseId/home',
    MOCK_ROUTE_2: `/course/:courseId/${encodeURIComponent('some+thing')}/:unitId`,
  },
}));

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

const renderPage = (props) => {
  const { container } = render(
    <Router initialEntries={[props?.pathname]}>
      <Routes>
        <Route path={props?.pattern?.path} element={<DecodePageRoute> {[]} </DecodePageRoute>} />
      </Routes>
    </Router>,
  );

  return { container };
};

describe('DecodePageRoute', () => {
  afterEach(() => {
    mockNavigate.mockClear();
  });

  it('should not modify the url if it does not need to be decoded', () => {
    const props = matchPath({
      path: '/course/:courseId/home',
    }, `/course/${decodedCourseId}/home`);
    const { container } = renderPage(props);

    expect(props.pathname).toContain(decodedCourseId);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });

  it('should decode the url and replace the history if necessary', () => {
    const props = matchPath({
      path: '/course/:courseId/home',
    }, `/course/${encodedCourseId}/home`);
    renderPage(props);

    expect(props.pathname).not.toContain(decodedCourseId);
    expect(props.pathname).toContain(encodedCourseId);
    expect(mockNavigate).toHaveBeenCalledWith(`/course/${decodedCourseId}/home`);
  });

  it('should decode the url multiple times if necessary', () => {
    const props = matchPath({
      path: '/course/:courseId/home',
    }, `/course/${deepEncodedCourseId}/home`);
    renderPage(props);

    expect(props.pathname).not.toContain(decodedCourseId);
    expect(props.pathname).toContain(deepEncodedCourseId);
    expect(mockNavigate).toHaveBeenCalledWith(`/course/${decodedCourseId}/home`);
  });

  it('should only decode the url params and not the entire url', () => {
    const decodedUnitId = 'some+thing';
    const encodedUnitId = encodeURIComponent(decodedUnitId);
    const props = matchPath({
      path: `/course/:courseId/${encodedUnitId}/:unitId`,
    }, `/course/${deepEncodedCourseId}/${encodedUnitId}/${encodedUnitId}`);
    renderPage(props);

    expect(mockNavigate).toHaveBeenCalledWith(`/course/${decodedCourseId}/${encodedUnitId}/${decodedUnitId}`);
  });
});

describe('decodeUrl', () => {
  expect(decodeUrl(decodedCourseId)).toEqual(decodedCourseId);
  expect(decodeUrl(encodedCourseId)).toEqual(decodedCourseId);
  expect(decodeUrl(deepEncodedCourseId)).toEqual(decodedCourseId);
});
