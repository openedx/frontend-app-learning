import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { shallow } from '@edx/react-unit-test-utils';

import TranslationSelection from './index';
import { initializeTestStore, render } from '../../../src/setupTest';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn().mockName('useContext').mockReturnValue({
    authenticatedUser: {
      userId: '123',
    },
  }),
}));
jest.mock('@openedx/paragon', () => ({
  IconButton: 'IconButton',
  Icon: 'Icon',
  ProductTour: 'ProductTour',
}));
jest.mock('@openedx/paragon/icons', () => ({
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
jest.mock('@edx/frontend-platform/analytics');

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
  it('does not send track event when source != target language', async () => {
    await initializeTestStore();
    render(<TranslationSelection {...props} />);
    expect(sendTrackEvent).not.toHaveBeenCalled();
  });
  it('sends track event when source != target language', async () => {
    await initializeTestStore();
    render(<TranslationSelection {...props} />);
    const eventName = 'edx.whole_course_translations.translation_requested';
    const eventProperties = {
      courseId: props.courseId,
      sourceLanguage: props.language,
      targetLanguage: 'en',
      unitId: props.unitId,
      userId: '123',
    };
    expect(sendTrackEvent).not.toHaveBeenCalledWith(eventName, eventProperties);
  });
});
