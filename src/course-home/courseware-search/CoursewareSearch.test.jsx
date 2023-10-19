import React from 'react';
import {
  fireEvent,
  initializeMockApp,
  render,
  screen,
} from '../../setupTest';
import { CoursewareSearch } from './index';
import { setShowSearch } from '../data/slice';
import { useElementBoundingBox, useLockScroll } from './hooks';

const mockDispatch = jest.fn();

jest.mock('./hooks');
jest.mock('../data/slice');
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const tabsTopPosition = 128;

function renderComponent(props = {}) {
  const { container } = render(<CoursewareSearch {...props} />);
  return container;
}

describe('CoursewareSearch', () => {
  beforeAll(async () => {
    initializeMockApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendering normally', () => {
    beforeAll(() => {
      useElementBoundingBox.mockImplementation(() => ({ top: tabsTopPosition }));
      renderComponent();
    });

    it('Should use useElementBoundingBox() and useLockScroll() hooks', () => {
      expect(useElementBoundingBox).toBeCalledTimes(1);
      expect(useLockScroll).toBeCalledTimes(1);
    });

    it('Should have a "--modal-top-position" CSS variable matching the CourseTabsNavigation top position', () => {
      const section = screen.getByTestId('courseware-search-section');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe(`${tabsTopPosition}px`);
    });

    it('Should dispatch setShowSearch(true) when clicking the close button', () => {
      const button = screen.getByTestId('courseware-search-close-button');
      fireEvent.click(button);

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(setShowSearch).toHaveBeenCalledTimes(1);
      expect(setShowSearch).toHaveBeenCalledWith(false);
    });
  });

  describe('when CourseTabsNavigation is not present', () => {
    it('Should use "--modal-top-position: 0" if  nce element is not present', () => {
      useElementBoundingBox.mockImplementation(() => undefined);
      renderComponent();

      const section = screen.getByTestId('courseware-search-section');
      expect(section.style.getPropertyValue('--modal-top-position')).toBe('0');
    });
  });

  describe('when passing extra props', () => {
    it('Should pass on extra props to section element', () => {
      renderComponent({ foo: 'bar' });

      const section = screen.getByTestId('courseware-search-section');
      expect(section).toHaveAttribute('foo', 'bar');
    });
  });
});
