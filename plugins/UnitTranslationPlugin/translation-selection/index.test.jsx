import { shallow } from '@edx/react-unit-test-utils';

import TranslationSelection from './index';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn().mockName('useContext').mockReturnValue({
    authenticatedUser: {
      userId: '123',
    },
  }),
}));
jest.mock('@edx/paragon', () => ({
  IconButton: 'IconButton',
  Icon: 'Icon',
  ProductTour: 'ProductTour',
}));
jest.mock('@edx/paragon/icons', () => ({
  Language: 'Language',
}));
jest.mock('./useTranslationTour', () => () => ({
  translationTour: {
    abitrarily: 'defined',
  },
  isOpen: false,
  open: jest.fn().mockName('open'),
  close: jest.fn().mockName('close'),
}));
jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockName('useDispatch'),
}));
jest.mock('@src/generic/plugin-store', () => ({
  registerOverrideMethod: jest.fn().mockName('registerOverrideMethod'),
}));
jest.mock('./TranslationModal', () => 'TranslationModal');
jest.mock('./useSelectLanguage', () => () => ({
  selectedLanguage: 'en',
  setSelectedLanguage: jest.fn().mockName('setSelectedLanguage'),
}));
jest.mock('../feedback-widget', () => 'FeedbackWidget');

describe('<TranslationSelection />', () => {
  const props = {
    id: 'plugin-test-id',
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    language: 'en',
    availableLanguages: [
      {
        code: 'en',
        label: 'English',
      },
      {
        code: 'es',
        label: 'Spanish',
      },
    ],
    unitId: 'unit-test-id',
  };
  it('renders', () => {
    const wrapper = shallow(<TranslationSelection {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
