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
    useModel.mockReturnValue({ language: 'en' });
    mockInitialState({ enabled: false });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });
  it('render empty when available languages is empty', () => {
    useModel.mockReturnValue({ language: 'fr' });
    mockInitialState({
      availableLanguages: [],
    });

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render empty when course language has not been set', () => {
    useModel.mockReturnValue({ language: undefined });
    mockInitialState({});

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('render TranslationSelection when translation is enabled and language is available', () => {
    useModel.mockReturnValue({ language: 'en' });
    mockInitialState({});

    const wrapper = shallow(<UnitTranslationPlugin {...props} />);

    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
