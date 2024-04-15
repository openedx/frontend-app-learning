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
  const mockInitialState = ({
    enabled = true,
    availableLanguages = ['en'],
    language = 'en',
    enrollmentMode = 'verified',
  }) => {
    useState.mockReturnValueOnce([{ enabled, availableLanguages }, jest.fn()]);

    when(useModel)
      .calledWith('coursewareMeta', props.courseId)
      .mockReturnValueOnce({ language, enrollmentMode });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('render empty when translation is not enabled', () => {
    mockInitialState({ enabled: false });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });
  it('render empty when available languages is empty', () => {
    mockInitialState({
      availableLanguages: [],
    });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render empty when course language has not been set', () => {
    mockInitialState({
      language: null,
    });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render empty when student is enroll as verified', () => {
    mockInitialState({
      enrollmentMode: 'audit',
    });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render TranslationSelection when translation is enabled and language is available', () => {
    mockInitialState({});

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
