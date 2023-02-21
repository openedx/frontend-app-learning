import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router, matchPath } from 'react-router';
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
  PageRoute: (props) => `PageRoute: ${JSON.stringify(props, null, 2)}`,
}));

const renderPage = (props) => {
  const memHistory = createMemoryHistory({
    initialEntries: [props?.path],
  });

  const history = {
    ...memHistory,
    replace: jest.fn(),
  };

  const { container } = render(
    <Router history={history}>
      <DecodePageRoute computedMatch={props} />
    </Router>,
  );

  return {
    container,
    history,
    props,
  };
};

describe('DecodePageRoute', () => {
  it('should not modify the url if it does not need to be decoded', () => {
    const props = matchPath(`/course/${decodedCourseId}/home`, {
      path: '/course/:courseId/home',
    });
    const { container, history } = renderPage(props);

    expect(props.url).toContain(decodedCourseId);
    expect(history.replace).not.toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });

  it('should decode the url and replace the history if necessary', () => {
    const props = matchPath(`/course/${encodedCourseId}/home`, {
      path: '/course/:courseId/home',
    });
    const { history } = renderPage(props);

    expect(props.url).not.toContain(decodedCourseId);
    expect(props.url).toContain(encodedCourseId);
    expect(history.replace.mock.calls[0][0]).toContain(decodedCourseId);
  });

  it('should decode the url multiple times if necessary', () => {
    const props = matchPath(`/course/${deepEncodedCourseId}/home`, {
      path: '/course/:courseId/home',
    });
    const { history } = renderPage(props);

    expect(props.url).not.toContain(decodedCourseId);
    expect(props.url).toContain(deepEncodedCourseId);
    expect(history.replace.mock.calls[0][0]).toContain(decodedCourseId);
  });

  it('should only decode the url params and not the entire url', () => {
    const decodedUnitId = 'some+thing';
    const encodedUnitId = encodeURIComponent(decodedUnitId);
    const props = matchPath(`/course/${deepEncodedCourseId}/${encodedUnitId}/${encodedUnitId}`, {
      path: `/course/:courseId/${encodedUnitId}/:unitId`,
    });
    const { history } = renderPage(props);

    const decodedUrls = history.replace.mock.calls[0][0].split('/');

    // unitId get decoded
    expect(decodedUrls.pop()).toContain(decodedUnitId);

    // path remain encoded
    expect(decodedUrls.pop()).toContain(encodedUnitId);

    // courseId get decoded
    expect(decodedUrls.pop()).toContain(decodedCourseId);
  });
});

describe('decodeUrl', () => {
  expect(decodeUrl(decodedCourseId)).toEqual(decodedCourseId);
  expect(decodeUrl(encodedCourseId)).toEqual(decodedCourseId);
  expect(decodeUrl(deepEncodedCourseId)).toEqual(decodedCourseId);
});
