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
jest.mock('react-redux', () => ({
  useDispatch: jest.fn().mockName('useDispatch'),
}));

describe('<TranslationSelection />', () => {
  const props = {
    id: 'plugin-test-id',
    courseId: 'course-v1:edX+DemoX+Demo_Course',
    language: 'en',
  };
  it('renders', () => {
    const wrapper = shallow(<TranslationSelection {...props} />);
    expect(wrapper.snapshot).toMatchSnapshot();
  });
});
