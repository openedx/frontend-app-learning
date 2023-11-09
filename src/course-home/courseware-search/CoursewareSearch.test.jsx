import React from 'react';
import { history } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { Route, Routes } from 'react-router-dom';
import {
  initializeMockApp,
  render,
  screen,
} from '../../setupTest';
import { CoursewareSearch } from './index';
import { useElementBoundingBox, useLockScroll } from './hooks';
import initializeStore from '../../store';
import { useModel } from '../../generic/model-store';

jest.mock('./hooks');
jest.mock('../../generic/model-store', () => ({
  useModel: jest.fn(),
}));

const decodedCourseId = 'course-v1:edX+DemoX+Demo_Course';
const decodedSequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';
const decodedUnitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@vertical_0270f6de40fc';
const pathname = `/course/${decodedCourseId}/${decodedSequenceId}/${decodedUnitId}`;

const tabsTopPosition = 128;

const defaultProps = {
  org: 'edX',
  loading: false,
  searchKeyword: '',
  errors: undefined,
  total: 0,
};

const intl = {
  formatMessage: (message) => message?.defaultMessage || '',
};

function renderComponent(props = {}) {
  const store = initializeStore();
  history.push(pathname);
  const { container } = render(
    <AppProvider store={store}>
      <Routes>
        <Route path="/course/:courseId/:sequenceId/:unitId" element={<CoursewareSearch intl={intl} {...props} />} />
      </Routes>
    </AppProvider>,
  );
  return container;
}

const mockModels = ((props = defaultProps) => {
  useModel.mockReturnValue(props);
});

describe('CoursewareSearch', () => {
  beforeAll(initializeMockApp);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendering normally', () => {
    beforeAll(() => {
      useElementBoundingBox.mockImplementation(() => ({ top: tabsTopPosition }));
    });

    it('Should use useElementBoundingBox() and useLockScroll() hooks', () => {
      mockModels();
      renderComponent();

      expect(useElementBoundingBox).toBeCalledTimes(1);
      expect(useLockScroll).toBeCalledTimes(1);
    });

    it('Should have a "--modal-top-position" CSS variable matching the CourseTabsNavigation top position', () => {
      mockModels();
      renderComponent();

      const section = screen.getByTestId('courseware-search-section');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe(`${tabsTopPosition}px`);
    });
  });

  describe('when CourseTabsNavigation is not present', () => {
    it('Should use "--modal-top-position: 0" if  nce element is not present', () => {
      useElementBoundingBox.mockImplementation(() => undefined);

      mockModels();
      renderComponent();

      const section = screen.getByTestId('courseware-search-section');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe('0');
    });
  });

  describe('when passing extra props', () => {
    it('Should pass on extra props to section element', () => {
      mockModels();
      renderComponent({ foo: 'bar' });

      const section = screen.getByTestId('courseware-search-section');
      expect(section).toHaveAttribute('foo', 'bar');
    });
  });
});
