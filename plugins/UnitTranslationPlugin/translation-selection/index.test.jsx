import { shallow } from '@edx/react-unit-test-utils';

import TranslationSelection from './index';

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

describe('<TranslationSelection />', () => {
  const props = {
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    selectedLanguage: 'en',
    setSelectedLanguage: jest.fn().mockName('setSelectedLanguage'),
  };
  it('renders', () => {
    const wrapper = shallow(<TranslationSelection {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
