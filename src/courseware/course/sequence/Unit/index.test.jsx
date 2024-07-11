import React from 'react';
import { when } from 'jest-when';
import { formatMessage, shallow } from '@edx/react-unit-test-utils/dist';
import { useSearchParams } from 'react-router-dom';

import { useModel } from '@src/generic/model-store';

import BookmarkButton from '../../bookmark/BookmarkButton';
import UnitSuspense from './UnitSuspense';
import ContentIFrame from './ContentIFrame';
import Unit from '.';
import messages from '../messages';
import { getIFrameUrl } from './urls';
import { modelKeys, views } from './constants';
import * as hooks from './hooks';

jest.mock('./hooks', () => ({ useUnitData: jest.fn() }));
jest.mock('react-router-dom');

jest.mock('@edx/frontend-platform/i18n', () => {
  const utils = jest.requireActual('@edx/react-unit-test-utils/dist');
  return {
    useIntl: () => ({ formatMessage: utils.formatMessage }),
    defineMessages: m => m,
  };
});

jest.mock('@src/generic/PageLoading', () => 'PageLoading');
jest.mock('../../bookmark/BookmarkButton', () => 'BookmarkButton');
jest.mock('./ContentIFrame', () => 'ContentIFrame');
jest.mock('./UnitSuspense', () => 'UnitSuspense');
jest.mock('../honor-code', () => 'HonorCode');
jest.mock('../lock-paywall', () => 'LockPaywall');

jest.mock('@src/generic/model-store', () => ({
  useModel: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(v => v),
}));

jest.mock('./hooks', () => ({
  useExamAccess: jest.fn(),
  useShouldDisplayHonorCode: jest.fn(),
}));

jest.mock('./urls', () => ({
  getIFrameUrl: jest.fn(),
}));

const props = {
  courseId: 'test-course-id',
  format: 'test-format',
  onLoaded: jest.fn().mockName('props.onLoaded'),
  id: 'test-props-id',
};

const context = { authenticatedUser: { test: 'user' } };
React.useContext.mockReturnValue(context);

const examAccess = {
  accessToken: 'test-token',
  blockAccess: false,
};
hooks.useExamAccess.mockReturnValue(examAccess);
hooks.useShouldDisplayHonorCode.mockReturnValue(false);

const unit = {
  id: 'unit-id',
  title: 'unit-title',
  bookmarked: false,
  bookmarkedUpdateState: 'pending',
};
const mockCoursewareMetaFn = jest.fn(() => ({ wholeCourseTranslationEnabled: false }));
const mockUnitsFn = jest.fn(() => unit);

when(useModel)
  .calledWith('courseHomeMeta', props.courseId)
  .mockImplementation(mockCoursewareMetaFn)
  .calledWith(modelKeys.units, props.id)
  .mockImplementation(mockUnitsFn);

let el;
describe('Unit component', () => {
  const searchParams = { get: (prop) => prop };
  const setSearchParams = jest.fn();

  beforeEach(() => {
    useSearchParams.mockImplementation(() => [searchParams, setSearchParams]);
    jest.clearAllMocks();
    el = shallow(<Unit {...props} />);
  });
  describe('behavior', () => {
    it('initializes hooks', () => {
      expect(hooks.useShouldDisplayHonorCode).toHaveBeenCalledWith({
        courseId: props.courseId,
        id: props.id,
      });
    });
  });
  describe('output', () => {
    let component;
    test('snapshot: not bookmarked, do not show content', () => {
      el = shallow(<Unit {...props} />);
      expect(el.snapshot).toMatchSnapshot();
    });
    describe('BookmarkButton props', () => {
      const renderComponent = () => {
        el = shallow(<Unit {...props} />);
        [component] = el.instance.findByType(BookmarkButton);
      };
      describe('not bookmarked, bookmark update loading', () => {
        beforeEach(() => {
          useModel.mockReturnValueOnce({ ...unit, bookmarkedUpdateState: 'loading' });
          renderComponent();
        });
        test('snapshot', () => {
          expect(component.snapshot).toMatchSnapshot();
        });
        test('props', () => {
          expect(component.props.isBookmarked).toEqual(false);
          expect(component.props.isProcessing).toEqual(true);
          expect(component.props.unitId).toEqual(unit.id);
        });
      });
      describe('bookmarked, bookmark update pending', () => {
        beforeEach(() => {
          mockUnitsFn.mockReturnValueOnce({ ...unit, bookmarked: true });
          renderComponent();
        });
        test('snapshot', () => {
          expect(component.snapshot).toMatchSnapshot();
        });
        test('props', () => {
          expect(component.props.isBookmarked).toEqual(true);
          expect(component.props.isProcessing).toEqual(false);
          expect(component.props.unitId).toEqual(unit.id);
        });
      });
    });
    test('UnitSuspense props', () => {
      el = shallow(<Unit {...props} />);
      [component] = el.instance.findByType(UnitSuspense);
      expect(component.props.courseId).toEqual(props.courseId);
      expect(component.props.id).toEqual(props.id);
    });
    describe('ContentIFrame props', () => {
      const testComponentProps = () => {
        expect(component.props.elementId).toEqual('unit-iframe');
        expect(component.props.id).toEqual(props.id);
        expect(component.props.loadingMessage).toEqual(formatMessage(messages.loadingSequence));
        expect(component.props.onLoaded).toEqual(props.onLoaded);
        expect(component.props.title).toEqual(unit.title);
      };
      const loadComponent = () => {
        el = shallow(<Unit {...props} />);
        [component] = el.instance.findByType(ContentIFrame);
      };
      describe('shouldShowContent', () => {
        test('do not show content if displaying honor code', () => {
          hooks.useShouldDisplayHonorCode.mockReturnValueOnce(true);
          loadComponent();
          testComponentProps();
          expect(component.props.shouldShowContent).toEqual(false);
        });
        test('do not show content if examAccess is blocked', () => {
          hooks.useExamAccess.mockReturnValueOnce({ ...examAccess, blockAccess: true });
          loadComponent();
          testComponentProps();
          expect(component.props.shouldShowContent).toEqual(false);
        });
        test('show content if not displaying honor code or blocked by exam access', () => {
          loadComponent();
          testComponentProps();
          expect(component.props.shouldShowContent).toEqual(true);
        });
      });
      describe('iframeUrl', () => {
        test('loads iframe url with student view if authenticated user', () => {
          loadComponent();
          testComponentProps();
          expect(component.props.iframeUrl).toEqual(getIFrameUrl({
            id: props.id,
            view: views.student,
            format: props.format,
            examAccess,
          }));
        });
        test('loads iframe url with public view if no authenticated user', () => {
          React.useContext.mockReturnValueOnce({});
          loadComponent();
          testComponentProps();
          expect(component.props.iframeUrl).toEqual(getIFrameUrl({
            id: props.id,
            view: views.public,
            format: props.format,
            examAccess,
          }));
        });
      });
    });
  });
});
