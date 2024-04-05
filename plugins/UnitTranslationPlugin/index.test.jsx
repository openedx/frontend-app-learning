import { when } from 'jest-when';

import { shallow } from '@edx/react-unit-test-utils';
import { useState } from 'react';
import { useModel } from '@src/generic/model-store';

import UnitTranslationPlugin from './index';

jest.mock('@src/generic/model-store');
jest.mock('./data/api', () => ({
  fetchTranslationConfig: jest.fn(),
}));
jest.mock('./translation-selection', () => 'TranslationSelection');
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

describe('<UnitTranslationPlugin />', () => {
  const props = {
    id: 'id',
    courseId: 'courseId',
    unitId: 'unitId',
  };
  const mockInitialState = ({ enabled = true, availableLanguages = ['en'] }) => {
    useState.mockReturnValue([{ enabled, availableLanguages }, jest.fn()]);
  };
  it('render empty when translation is not enabled', () => {
    const mockCoursewareMetaFn = jest.fn(() => ({ language: 'en' }));
    const mockCourseHomeMetaFn = jest.fn(() => ({ verifiedMode: { accessExpirationDate: null } }));
    when(useModel)
      .calledWith('courseHomeMeta', props.courseId)
      .mockImplementation(mockCourseHomeMetaFn)
      .calledWith('coursewareMeta', props.courseId)
      .mockImplementation(mockCoursewareMetaFn);
    mockInitialState({ enabled: false });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });
  it('render empty when available languages is empty', () => {
    const mockCoursewareMetaFn = jest.fn(() => ({ language: 'fr' }));
    const mockCourseHomeMetaFn = jest.fn(() => ({ verifiedMode: { accessExpirationDate: null } }));
    when(useModel)
      .calledWith('courseHomeMeta', props.courseId)
      .mockImplementation(mockCourseHomeMetaFn)
      .calledWith('coursewareMeta', props.courseId)
      .mockImplementation(mockCoursewareMetaFn);
    mockInitialState({
      availableLanguages: [],
    });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render empty when course language has not been set', () => {
    const mockCoursewareMetaFn = jest.fn(() => ({ language: undefined }));
    const mockCourseHomeMetaFn = jest.fn(() => ({ verifiedMode: { accessExpirationDate: null } }));
    when(useModel)
      .calledWith('courseHomeMeta', props.courseId)
      .mockImplementation(mockCourseHomeMetaFn)
      .calledWith('coursewareMeta', props.courseId)
      .mockImplementation(mockCoursewareMetaFn);
    mockInitialState({});

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render empty when verifiedMode has not been set', () => {
    const mockCoursewareMetaFn = jest.fn(() => ({ language: 'en' }));
    const mockCourseHomeMetaFn = jest.fn(() => ({ verifiedMode: null }));
    when(useModel)
      .calledWith('courseHomeMeta', props.courseId)
      .mockImplementation(mockCourseHomeMetaFn)
      .calledWith('coursewareMeta', props.courseId)
      .mockImplementation(mockCoursewareMetaFn);
    mockInitialState({});

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render TranslationSelection when translation is enabled and language is available', () => {
    const mockCoursewareMetaFn = jest.fn(() => ({ language: 'en' }));
    const mockCourseHomeMetaFn = jest.fn(() => ({ verifiedMode: { accessExpirationDate: null } }));
    when(useModel)
      .calledWith('courseHomeMeta', props.courseId)
      .mockImplementation(mockCourseHomeMetaFn)
      .calledWith('coursewareMeta', props.courseId)
      .mockImplementation(mockCoursewareMetaFn);
    mockInitialState({});

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
